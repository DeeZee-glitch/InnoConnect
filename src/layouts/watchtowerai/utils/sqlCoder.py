import psycopg2
from psycopg2 import sql
import ollama
import subprocess
import uuid
import json  # Import JSON for formatting results
from datetime import datetime
from decimal import Decimal
from flask import Flask, request, jsonify
from flask_cors import CORS
from fuzzywuzzy import process
import sys
import os
import threading
import re
import random
import string
import spacy
from collections import Counter
 
app = Flask(__name__)
CORS(app)
 
# Global flag to indicate if the chat should be stopped
stop_flag = False
 
# Database connection parameters
DB_CONFIG = {
    "dbname": "businessinsight",
    "user": "audituser",
    "password": "manage",
    "host": "localhost",
    "port": 5432
}
 
# Function to create the table if it doesn't exist
def create_table():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS context_store (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(50),
                context TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error creating table: {e}")
 
# Function to store context in the database
def store_context():
    try:
        # Run Ollama command
        result = subprocess.run(
            ["ollama", "run", "llama3:8b"],
            text=True,
            capture_output=True,
            check=True
        )
 
        context = result.stdout  # Extract context
 
        # Store context in PostgreSQL
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO context_store (user_id, context) VALUES (%s, %s)", (user_id, context))
        conn.commit()
       
        cursor.close()
        conn.close()
 
        return "Context stored in database successfully."
 
    except subprocess.CalledProcessError as e:
        return f"Error running Ollama: {e.stderr}"
    except Exception as db_error:
        return f"Database error: {db_error}"
 
# Ensure table exists
create_table()
 
# Store context
print(store_context())
 
# Function to set the stop flag
def set_stop_flag():
    global stop_flag
    stop_flag = True
 
# Function to reset the stop flag
def reset_stop_flag():
    global stop_flag
    stop_flag = False
 
 
# Function to connect to the database
def connect_to_database():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("Database connection established.")
        return conn
    except Exception as e:
        print("Error connecting to the database:", e)
        exit()
 
# Function to map a question to the appropriate table using fuzzy matching
def get_friendly_response(question):
    """
    Generates a user-friendly response when the question
    does not match any known table.
    """
    prompt = f"""The user asked: "{question}".
    Unfortunately, I couldn't map this to a known data table.
    Please generate error message suggesting only to ask the question
    related to monitoring and analytics and how they can refine their query.
    """
   
    return run_llama3(prompt)  # Call your model to generate a response
 
def map_question_to_table(question):
    question = question.lower()
 
    # Define a mapping of questions to tables
    table_questions = {
        "monitor_rules": [
            "show me the status",
            "what's going on",
            "status, please",
            "summarize",
            "what's the root cause",
            "generate me the report of all possible issues",
            "can you give a summary",
            "what are the findings",
            "tell me the issues",
            "overview of the problems"
        ],
        "monitor_rules_logs": [
            "what's the action taken",
            "who are the stakeholders",
            "details of actions",
            "list stakeholders",
            "actions summary",
            "report actions",
            "stakeholders involved",
            "who is responsible",
            "notification",
            "actions performed"
        ]
    }
 
    # Flatten the list of questions with table names
    all_questions = [(q, table) for table, questions in table_questions.items() for q in questions]
 
    # Use fuzzy matching to find the best match
    matches = process.extractOne(question, [q[0] for q in all_questions])
    if matches and matches[1] > 70:  # Confidence threshold
        best_match = matches[0]
        for q, table in all_questions:
            if q == best_match:
                return table
 
    # If no match is found, raise a ValueError with a dynamic message
    error_message = get_friendly_response(question)
    raise ValueError(error_message)
   
 
# Function to fetch and display all tables in the database
def list_tables(conn):
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public';
        """)
        tables = cursor.fetchall()
        for table in tables:
            print(f"- {table[0]}")
        return [table[0] for table in tables]
    except Exception as e:
        print("Error fetching table list:", e)
        return []
 
# Function to set context for SQL generation
def set_context(prompt, table_name):
    query_prompt = f"""
    - You are a SQL assistant. Your task is to generate an SQL SELECT query based on the provided query: {prompt}.
    - Always use the {table_name} table as the reference for this query and show all columns.
    - Do not generate suggestions, explanations, or additional text.
    - The SQL SELECT query must work on the database schema.
 
    """
    return query_prompt
 
def set_context_for_JSON_summary(json_result):
    contexed_JSON = f"""
    - Analyze the following JSON and extract key information to users. Do not use word JSON in your response and do not explain how you extracted it.
    - If it contains violations (IS_VIOLATED='TRUE') records, refer RULE_NAME for arriving the root cause and explain the possible cause using it. Dont refer USE CALANDAR column.
    - Else if it contains channel records, refer the CHANNEL column for explaining the summary in one line.
    - Return with "Summary" and, or  "Root cause" in bold heading. Do not use numbering.
    - {json_result}
    """
    return contexed_JSON
 
def set_context_for_NLP_summary(natural_language_query):
    contexed_NLP_query = f"""
    - Analyze the following query and give the response only if the question is related to Monitoring or analytics.
    - If the question is not in the context of monitoring or analytics, response that, you have been programmed only to answer question in context of Monitoring or analytics.
    - {natural_language_query}
    """
    return contexed_NLP_query
 
def ensure_select_query(sql_query, table_name):
    """
    Ensures the given query is a SELECT query and modifies it to include a WHERE clause
    if it contains the keyword 'condition', 'via', 'where'.
   
    Parameters:
    - sql_query (str): The SQL query to validate or modify.
    - table_name (str): The table name to use if modification is needed.
   
    Returns:
    - str: The validated or adjusted SQL query.
    """
    sql_query = sql_query.strip()
   
    # Check if the query starts with SELECT
    if sql_query.upper().startswith("SELECT"):
        # Check for 'condition' and add WHERE if not present
        if "where" in sql_query.lower() and "condition" not in sql_query.lower():
            sql_query += ""
        return sql_query
    else:
        # Generate a default SELECT query with WHERE condition if 'condition' exists
        print("Generated query is not a SELECT query. Adjusted query.")
        if "condition" in sql_query.lower():
            sql_query = f"SELECT * FROM {table_name} WHERE condition"
        else:
            sql_query = f"SELECT * FROM {table_name}"
        return sql_query
 
 
 
# def clear_context():
#     try:
#         result = subprocess.run(
#             ["ollama", "run", "llama3:8b"],
#             text=True,
#             capture_output=True,
#             check=True
#         )
#         return result
#     except subprocess.CalledProcessError as e:
#         return f"Error: {e.stderr}"
 
# Modify run_llama3 to check for stop flag
def run_llama3(structured_prompt):
    """
    Runs the Ollama llama3 model via the CLI.
    """
    try:
        print("---Running model---")
       
        # Check if the stop flag is set before running the command
        if stop_flag:
            print("Process interrupted by stop request.")
            return "Chat stopped by user request."
       
        result = subprocess.run(
            ["ollama", "run", "llama3:8b"],
            input=structured_prompt,  
            text=True,  
            capture_output=True,
            check=True,
        )
        natural_output_response = result.stdout.strip()
        print("response:", natural_output_response)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print("Error running llama3:", e.stderr)
        return None
 
# Function to format query results as JSON (array-based)
def format_query_results_as_json_array(cursor, rows):
    """
    Converts query results into an array-based JSON format with columns and rows.
 
    Args:
        cursor: The database cursor with metadata.
        rows: Fetched rows from the query result.
 
    Returns:
        JSON-formatted string with columns and rows as arrays.
    """
    try:
        # Extract column names
        column_names = [desc[0] for desc in cursor.description]
       
        # Convert rows to a list of lists
        formatted_rows = []
        for row in rows:
            formatted_row = []
            for value in row:
                # Convert datetime objects to ISO string
                if isinstance(value, datetime):
                    formatted_row.append(value.isoformat())
                # Convert Decimal objects to float
                elif isinstance(value, Decimal):
                    formatted_row.append(float(value))
                else:
                    formatted_row.append(value)
            formatted_rows.append(formatted_row)
       
        # Combine column names and rows in the desired structure
        result = {
            "columns": column_names,
            "rows": formatted_rows
        }
       
        # Return JSON string with indentation for readability
        return json.dumps(result, indent=4)
    except Exception as e:
        print("Error formatting query results as JSON:", e)
        return json.dumps({"error": str(e)})
 
 
 
# Function to format query results as JSON for charts
def format_query_results_as_json_array_charts(cursor, rows):
    """
    Converts query results into an array-based JSON format for chart datasets.
 
 
    Args:
        cursor: The database cursor with metadata.
        rows: Fetched rows from the query result.
 
    Returns:
        JSON-formatted string with labels (values from `log_timestamp`,) and datasets.
    """
    try:
        # Extract column names
        column_names = [desc[0] for desc in cursor.description]
 
        # Identify the index of the `log_timestamp` column
        try:
            label_index = column_names.index("log_timestamp")
        except ValueError:
            print("Column 'log_timestamp' not found in query result. Using current timestamp as label.")
            label_index = None
 
        # Build labels and datasets
        labels = []
        datasets = []
        for row in rows:
            if label_index is not None:
                label_value = row[label_index]
                if isinstance(label_value, datetime):
                    labels.append(label_value.isoformat())  # Convert datetime to ISO format
                else:
                    labels.append(label_value)
            else:
                labels.append(datetime.now().isoformat())  # Use current timestamp
 
            # Add the rest of the row as a dataset (excluding the label column if present)
            dataset = {
                column_names[idx]: (float(value) if isinstance(value, Decimal) else value)
                for idx, value in enumerate(row) if idx != label_index
            }
            datasets.append(dataset)
 
        # Create the final result structure
        result = {
            "labels": labels,  # Use `log_timestamp` column or current timestamp for labels
            "datasets": datasets,  # Remaining columns as datasets
        }
 
        return json.dumps(result, indent=4)
 
    except Exception as e:
        print("Error formatting query results as JSON:", e)
        return json.dumps({"error": str(e)})
 
 
# Function to execute the SQL query and fetch results
def execute_query(conn, sql_query, natural_language_query):
    try:
        print(f"Executing query: {sql_query}")  # Debug print to confirm query is being passed
       
        cursor = conn.cursor()
        cursor.execute(sql_query)
        rows = cursor.fetchall()
       
        print(f"Query executed successfully. Number of rows fetched: {len(rows)}")
       
        # Check if 'chart' or 'table' is mentioned in the natural language query
        if "chart" in natural_language_query.lower():
            json_result = format_query_results_as_json_array_charts(cursor, rows)
            print("Query Results (Chart-Based JSON):")
        else:
            json_result = format_query_results_as_json_array(cursor, rows)
            print("Query Results (Table-Based JSON):")
       
        print(json_result)
        return json_result
    except Exception as e:
        print(f"Error executing query: {str(e)}")
        return None
 
def predict_output_format(query):
            # Convert the query to lowercase for case-insensitive matching
            query = query.lower()
            # Check for patterns indicative of a table response (like asking for comparisons, lists, or structured data)
            table_keywords = ['list', 'compare', 'table', 'data', 'spreadsheet', 'report', 'show']
            chart_keywords = ['chart', 'graph', 'plot', 'visualize', 'diagram', 'trend']
            # Check if any chart-related keywords are in the query
            if any(keyword in query for keyword in chart_keywords):
                return 'Chart response'
            # Check if any table-related keywords are in the query
            elif any(keyword in query for keyword in table_keywords):
                return 'Table response'
            # If none of the above, assume a natural text response
            else:
                return 'Natural text response'
 
def stop_chat():
    try:
        # Send the /bye command to Ollama
        result = subprocess.run(
            ["ollama", "run", "llama3:8b"],
            input="/bye",
            text=True,
            capture_output=True,
            check=True
        )
        return result
    except subprocess.CalledProcessError as e:
        return f"Error: {e.stderr}"
 
def call_watchtower_procedure(conn, natural_language_query):
    """
    Dynamically analyzes the user input to create feed, monitor, and conditions based on input details.
    """
 
    def extract_feed_name(natural_language_query):
        # Load the English NLP model
        nlp = spacy.load("en_core_web_sm")
        doc = nlp(natural_language_query)
       
        # Define lowercase versions of keywords for proper matching
        monitoring_keywords = [
            "api requests", "support tickets", "shippingstatus",
            "sap order", "shipment notifications", "customer",
            "shipping amount", "refund", "shipping status", "invoice", "order status", "request"
        ]
        # anomaly_keywords = [
        #     "status", "failure", "error", "threshold", "log", "activity", "event",
        #     "pending", "declined", "cancelled", "on hold", "not responded", "exceeds",
        #     "high priority", "low priority", "request"
        # ]
        anomaly_keywords = []
 
        # Convert input query to lowercase for matching
        input_text_lower = natural_language_query.lower()
 
        # Check if any full keyword matches from monitoring_keywords
        monitoring_term = next((kw.capitalize() for kw in monitoring_keywords if kw in input_text_lower), None)
        anomaly_term = next((kw.capitalize() for kw in anomaly_keywords if kw in input_text_lower), None)
       
        # Extract nouns and named entities
        words = [token.text.lower() for token in doc if token.pos_ in ["NOUN", "PROPN"]]
        entities = [ent.text.lower() for ent in doc.ents]
        words += entities  # Combine both lists
 
        # If no predefined keywords match, use the most common noun
        if not monitoring_term and words:
            monitoring_term = Counter(words).most_common(1)[0][0].capitalize()
        if not anomaly_term:
            anomaly_term = "Feed"
       
        print(monitoring_term)
        print(anomaly_term)
 
        feed_name = f"{monitoring_term} {anomaly_term}"
        monitor_system_name = feed_name.replace("Feed", "Monitor")
        rule_name = feed_name.replace("Feed", "Rule")
        definition_name = feed_name.replace("Feed", "Rule Definition")
       
        return {
            "feed_name": feed_name,
            "monitor_name": monitor_system_name,
            "rule_name": rule_name,
            "definition_name": definition_name
        }
 
        # Example inputs
        inputs = [
           
            "Set a monitor and alert me via email if the number of API requests exceeds 10 in a 10-minute period"
            "Set a monitor and alert me via slack if the number of API requests with status failed exceeds 5 in a 10-minute period"
            "Set a monitor and alert me via pagerduty if the number of API requests with status success exceeds 5 in a 10-minute period"
            "Set a monitor and alert me via opsgenie if the number of API requests with status pending exceeds 5 in a 10-minute period"
            "Set a monitor and alert me via teams if more than 10 support tickets of high priority remains not responded for over 2 hours"
            "Set a monitor and alert me via sms if more than 10 support tickets of low priority remains not responded for over 2 hours"
            "Set a monitor and alert me via opsgenie if more than 30 refund requests are submitted within a one-hour window"
            "Set a monitor and alert me via pagerduty if more than 30 cancelled requests are submitted within a one-hour window"
            "Set a monitor and alert me via pagerduty if more than 20 Order Status is Failed in last 20 minutes with failed Status"
            "Set a monitor and alert me via pagerduty if more than 25 Order Status is Pending in last 30 minutes with pending Status"
            "Set a monitor and alert me via pagerduty if more than 25 Order Status is Success in last 30 minutes with success Status"
            "Set a monitor and alert me via pagerduty if Customer Name == John Doe and Total Price is more than 20"
            "Set a monitor and alert me via pagerduty if more than 20 orders have shipment notifications Pending for over 3 hours"
            "Set a monitor and alert me via pagerduty if more than 10 orders have shipment notifications Failed for over 3 hours"
            "Set a monitor and alert me via pagerduty if more than 30 orders have shipment notifications Cancelled for over 3 hours"
            "Set a monitor and alert me via pagerduty if more than 30 orders have shipment notifications Declined for over 3 hours"
            "Set a monitor and alert me via pagerduty if any shippingStatus remains in the 'PENDING' state for over 3 hours"
            "Set a monitor and alert me via pagerduty if any shippingStatus remains in the 'FAILED' state for over 3 hours"
            "Set a monitor and alert me via pagerduty if any shippingStatus remains in the ''CANCELLED' state for over 3 hours"
            "Set a monitor and alert me via pagerduty if any shippingStatus remains in the 'ON HOLD' state for over 3 hours"
            "Set a monitor and alert me via pagerduty if Customer with name John Doe ticket with open ticket status not responded to within 2 hours ."
            "Set a monitor and alert me via pagerduty if grand total value of invoice is more than 15000 within 10 minutes"
            "Set a monitor and alert me via pagerduty if Customer Name == John Doe and grandTotal Amount is more than 200"
            "Set a monitor and alert me via pagerduty if total price more than 100 have shipment notifications pending for over 3 hours"
            "Set a monitor and alert me via pagerduty if total price more than 100 have shipment notifications failed for over 3 hours"
            "Set a monitor and alert me via pagerduty if total price more than 100 have shipment notifications success for over 3 hours"
            "Set a monitor and alert me via pagerduty if  Shipment notifications are pending for more than 3 hours if  Transaction Amount > 200"
            "Set a monitor and alert me via pagerduty if  Shipment notifications are failed for more than 3 hours if  Transaction Amount > 25"
            "Set a monitor and alert me via pagerduty if the total shipping amount is more than 5000 in last 5 minutes"
        ]
 
    def extract_measurement_details(input_text):
        """Extracts measurement details such as field, comparator, threshold, and duration from the input."""
 
        # Define possible statuses
        status_keywords = ["failed", "success", "pending", "refund", "on hold", "cancelled", "declined", "not responded"]
 
        # Identify the comparator/status from user input
        comparator = next((status.upper() for status in status_keywords if status in input_text.lower()), "UNKNOWN")
 
        # Extract threshold (number of occurrences)
        threshold_match = re.search(r"(\d+)", input_text, re.IGNORECASE)
        threshold = int(threshold_match.group(1)) if threshold_match else 10  # Default to 10 if not specified
 
        # Extract time duration
        time_match = re.search(r"(\d+)\s*(minute|hour)s?", input_text, re.IGNORECASE)
        if time_match:
            time_value = int(time_match.group(1))
            time_unit = time_match.group(2)
            time_duration_minutes = time_value * 60 if "hour" in time_unit else time_value
        else:
            time_duration_minutes = 60  # Default to 60 minutes if not specified
 
        # Extract action channel correctly
        action_keywords = {
            "email": "SEND_EMAIL",
            "sms": "SMS",
            "slack": "SLACK_MESSAGE",
            "pagerduty": "PAGERDUTY_TICKET",
            "opsgenie": "OPSGENIE_ALERTS",
            "teams": "TEAMS_MESSAGE"
        }
       
        action_channel = "sms"  # Default if no match found
        for keyword, channel in action_keywords.items():
            if keyword in input_text.lower():
                action_channel = channel
                break  # Stop at the first match
 
        return {
            "measure_transaction": "TRUE",
            "comparator": comparator,
            "condition_operator": "=",
            "threshold": threshold,
            "time_duration_minutes": time_duration_minutes,
            "action_channel": action_channel,
            "evaluation_operator": ">",  # 'More than' translates to a 'greater than' operator
            "measure_field_path": "/order/orderStatus/status",  # You may refine this dynamically
        }
 
           
    def extract_action_details(input_text):
        """Extracts the action details like Email, SMS, Slack, etc."""
        action_keywords = {
            "email": "SEND_EMAIL",
            "sms": "SMS",
            "slack": "SLACK_MESSAGE",
            "pagerduty": "PAGERDUTY_TICKET",
            "opsgenie": "OPSGENIE_ALERTS",
            "teams": "TEAMS_MESSAGE"
        }
 
        # Default action channel
        action_channel = None
 
        # Iterate through possible channels
        for keyword, channel in action_keywords.items():
            if keyword in input_text.lower():
                action_channel = channel
                break  # Stop at first match
 
        # If no valid channel found, return empty dictionary
        if not action_channel:
            return {}
 
        return {
            "action_config": {"channel": action_channel, "message": input_text}
        }
        print(action_channel)
 
    try:
        # Dynamically extract details based on user input
        measurement_details = extract_measurement_details(natural_language_query)
        action_details = extract_action_details(natural_language_query)
 
        # If the necessary details are not found, return an error
        if not measurement_details:
            return {"error": "Could not extract measurement details from input."}
 
        # Generate dynamic names based on input
        # Extract feed names properly
        feed_data = extract_feed_name(natural_language_query)
        feed_name = feed_data["feed_name"]
        monitor_system_name = feed_data["monitor_name"]
        rule_name = feed_data["rule_name"]
        definition_name = feed_data["definition_name"]
       
 
        # Extracted details from user input
        measure_transaction = measurement_details["measure_transaction"]
        comparator = measurement_details["comparator"]
        condition_operator = measurement_details["condition_operator"]
        threshold = measurement_details["threshold"]
        time_duration_minutes = measurement_details["time_duration_minutes"]
        action_channel = measurement_details["action_channel"]
        evaluation_operator = measurement_details["evaluation_operator"]
        measure_field_path = measurement_details["measure_field_path"]
 
        # Action configuration
        action_config = action_details.get("action_config", "")
        if isinstance(action_config, dict):
            action_config = json.dumps(action_config)
 
        # Define other parameters dynamically based on input
        is_active = "TRUE"
        is_update_only = "FALSE"
        execute_on = "TRANSITION"
        do_remind = "FALSE"
        use_calendar = "FALSE"
        calendar_name = ""  
        use_query = "TRUE"
        evaluation_query = f"SELECT SUM(cummulative_measure) AS measure FROM monitored_facts WHERE START_TIME > NOW() - INTERVAL '{int(time_duration_minutes)}'"
        evaluated_measure = f"{threshold}"
        evaluation_operator = evaluation_operator
        group_operator = "AND"  # Default grouping operator for the condition
 
        # Call the stored procedure with dynamically generated parameters
        cursor = conn.cursor()
        query = """
            CALL public.watchtowerstoreprocedure(
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
        """
        params = (
            feed_name, is_active, monitor_system_name, f"Monitor for {monitor_system_name}",
            measure_field_path, measure_transaction, "",  # Identity field is empty
            "timestamp", "YYYY-MM-DD HH24:MI:SS", measure_field_path,
            condition_operator, comparator, group_operator, is_update_only,
            rule_name, "FALSE", execute_on, is_active, do_remind,
            f"{time_duration_minutes}", use_calendar, calendar_name, use_query,
            evaluation_query, evaluated_measure, evaluation_operator,
            group_operator, definition_name, "TRUE", action_config
        )
 
        cursor.execute(query, params)
        conn.commit()
 
        # Return the generated names and parameters
        return {
            "feed_name": feed_name,
            "monitor_system_name": monitor_system_name,
            "rule_name": rule_name,
            "definition_name": definition_name,
            "measure_field_path": measure_field_path,
            "evaluation_query": evaluation_query,
            "action_config": action_config
        }
       
 
    except Exception as e:
        error_message = str(e)
        # Limit error message to the first two lines
        error_lines = error_message.splitlines()[:2]
        limited_error_message = "\n".join(error_lines)
 
        error_json = {
            "response": type(e).__name__,
            "error_message": limited_error_message
        }
 
        print(f"Error in stored procedure call: {error_json}")
        return error_json
 
 
 
 
@app.route('/stop', methods=['POST'])
def stop_chat_session():
    try:
        # Set the stop flag to True to stop the ongoing request
        set_stop_flag()
       
        # Optionally, also send the /bye command to Ollama if needed
        stop_chat()
        return jsonify({"status": "success", "message": "Ollama chat stopped."})
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": f"Error stopping chat: {e.stderr}"})
 
# Main workflow
@app.route('/query', methods=['POST'])
def main():
    global stop_flag
    try:
 
        # Check if stop flag is set
        if stop_flag:
            return jsonify({"error": "Request stopped by user."})
 
        data = request.get_json()
        natural_language_query = data.get("query")
       
        print("1. Connecting to database")
        conn = connect_to_database()
 
        # Check if the query contains the word 'create'
        if "alert" in natural_language_query.lower():
            print("Query contains 'alert', invoking stored procedure function.")
            # Call the stored procedure function and return the result
            result = call_watchtower_procedure(conn, natural_language_query)
            print({"response": result})
            return jsonify({"result": result})  # Ensure to return the result here and terminate
 
       
        print("2. Fetching table mapping")
        try:
            table_name = map_question_to_table(natural_language_query)
            print(f"Mapped to table: {table_name}")
        except ValueError as e:
            return jsonify({"error": str(e)})
 
        print("3. Predicting output format")
        outputFormat = predict_output_format(natural_language_query)
        print(f"Predicted Output Format: {outputFormat}")
 
        print("4. Setting context for SQL generation")
        structured_prompt = set_context(natural_language_query, table_name)
 
        if outputFormat != "Natural text response":
            print("5. Invoking model to generate SQL query")
            sql_query = run_llama3(structured_prompt)
            print(f"Generated SQL query: {sql_query}")
 
            print("6. Validating SQL query")
            sql_query = ensure_select_query(sql_query, table_name)
 
            print("7. Executing SQL query")
            json_result = execute_query(conn, sql_query, natural_language_query)
           
            if json_result:
                print("11. Summarizing the JSON results")
                contexted_json = set_context_for_JSON_summary(json_result)
                summarize_result = run_llama3(contexted_json)
                print(f"Summary: {summarize_result}")
                return jsonify({"result": json.loads(json_result), "summary": summarize_result})
           
            else:
                # Generate a user-friendly failure message using the model
                print("Error message when query is not executed!!!")
                error_context = f"The query `{sql_query}` could not be executed. Provide a user-friendly explanation."
                user_friendly_error = run_llama3(error_context)
                return jsonify({"error": user_friendly_error})
 
        else:
            print("5. Generating natural language response")
            contexted_natural_query = set_context_for_NLP_summary(natural_language_query)
            natural_response = run_llama3(contexted_natural_query)
            return jsonify({"response": natural_response})
 
   
    except Exception as e:
        print(f"Error during workflow execution: {str(e)}")
        return jsonify({"error": str(e)})
 
    finally:
        # Reset the stop flag after processing the request
        reset_stop_flag()
       
        if 'conn' in locals() and conn:
            conn.close()
            print("Database connection closed.")
 
if __name__ == "__main__":
    app.run(debug=True)