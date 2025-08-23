/* eslint-disable prettier/prettier */

import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import MDButton from "components/MDButton";
import { useTable, usePagination, useGlobalFilter, useAsyncDebounce, useSortBy } from "react-table";
import {
  Table,
  TableBody,
  TableContainer,
  TableRow,
  IconButton,
  TableCell,
  Icon,
  Autocomplete,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import MDBox from "components/MDBox";

import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDPagination from "components/MDPagination";
import DataTableHeadCell from "examples/Tables/DataTable/DataTableHeadCell";
import DataTableBodyCell from "examples/Tables/DataTable/DataTableBodyCell";

function DataTableExpandableRow({
  entriesPerPage,
  canSearch,
  showTotalEntries,
  table,
  pagination,
  isSorted,
  noEndBorder,
  openModal,
}) {
  const defaultValue = entriesPerPage.defaultValue ? entriesPerPage.defaultValue : 10;
  const entries = entriesPerPage.entries
    ? entriesPerPage.entries.map((el) => el.toString())
    : ["5", "10", "15", "20", "25"];

  const columns = useMemo(() => table.columns, [table]);
  const data = useMemo(() => table.rows, [table]);

  const tableInstance = useTable(
    { columns, data, initialState: { pageIndex: 0 } },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    pageOptions,
    canPreviousPage,
    canNextPage,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setGlobalFilter,
    state: { pageIndex, pageSize, globalFilter },
  } = tableInstance;

  // Set the default value for the entries per page when component mounts
  useEffect(() => setPageSize(defaultValue || 5), [defaultValue]);
  // Set the default value for the entries per page when component mounts
  const setEntriesPerPage = (value) => {
    setPageSize(value);
  };
  //Render pagination
  const renderPagination = pageOptions.map((option) => (
    <MDPagination
      item
      key={option}
      onClick={() => gotoPage(Number(option))}
      active={pageIndex === option}
    >
      {option + 1}
    </MDPagination>
  ));
  // Handler for the input to set the pagination index
  const handleInputPagination = ({ target: { value } }) =>
    value > pageOptions.length || value < 0 ? gotoPage(0) : gotoPage(Number(value));

  // Customized page options starting from 1
  const customizedPageOptions = pageOptions.map((option) => option + 1);

  // Setting value for the pagination input
  const handleInputPaginationValue = ({ target: value }) => gotoPage(Number(value.value - 1));

  const [expandedRows, setExpandedRows] = useState([]);
  // const [expandedRows, setExpandedRows] = useState(() => {
  //   return data
  //     .filter((row) =>
  //       data.some((childRow) => childRow.parentID === row.uniqueTransactionID)
  //     )
  //     .map((row) => row.uniqueTransactionID); // Ensure this matches the identifier of the rows
  // });

  const toggleRowExpansion = (uniqueTransactionID) => {
    setExpandedRows((prevState) =>
      prevState.includes(uniqueTransactionID)
        ? prevState.filter((rowId) => rowId !== uniqueTransactionID)
        : [...prevState, uniqueTransactionID]
    );
  };

  const [search, setSearch] = useState(globalFilter);
  const onSearchChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 100);

  const setSortedValue = (column) => {
    if (isSorted && column.isSorted) {
      return column.isSortedDesc ? "desc" : "asc";
    }
    return isSorted ? "none" : false;
  };

  const entriesStart = pageIndex === 0 ? pageIndex + 1 : pageIndex * pageSize + 1;
  // Setting the entries ending point
  let entriesEnd;

  if (pageIndex === 0) {
    entriesEnd = pageSize;
  } else if (pageIndex === pageOptions.length - 1) {
    entriesEnd = rows.length;
  } else {
    entriesEnd = pageSize * (pageIndex + 1);
  }

  const sharedRowStyle = {
    fontSize: "14px",
    fontFamily: "Roboto, sans-serif",
  };
  const handleCorrelationIDClick = (correlationID) => {
    // Open a new tab with the current page and pass the correlationID as a query parameter
    const newTabUrl = `${window.location.origin}${window.location.pathname}?correlationID=${correlationID}`;
    window.open(newTabUrl, "http://172.20.150.10:5555:3000/smartLog");

    console.log("Opened new tab for CorrelationID:", correlationID);
  };

  return (
    <TableContainer sx={{ boxShadow: "none" }}>
      {(entriesPerPage || canSearch) && (
        <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
          {entriesPerPage && (
            <MDBox display="flex" alignItems="center">
              <Autocomplete
                disableClearable
                value={pageSize.toString()}
                options={entries}
                onChange={(event, newValue) => setEntriesPerPage(parseInt(newValue, 10))}
                size="small"
                sx={{ width: "5rem" }}
                renderInput={(params) => <MDInput {...params} />}
              />
              <MDTypography variant="caption" color="secondary">
                &nbsp;&nbsp;entries per page
              </MDTypography>
            </MDBox>
          )}
          {canSearch && (
            <MDBox width="12rem" ml="auto">
              <MDInput
                placeholder="Search..."
                value={search}
                size="small"
                fullWidth
                onChange={({ currentTarget }) => {
                  setSearch(currentTarget.value);
                  onSearchChange(currentTarget.value);
                }}
              />
            </MDBox>
          )}
        </MDBox>
      )}
      <Table {...getTableProps()}>
        <MDBox component="thead">
          {headerGroups.map((headerGroup, key) => (
            <TableRow key={key} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, idx) => (
                <DataTableHeadCell
                  key={idx}
                  {...column.getHeaderProps(isSorted && column.getSortByToggleProps())}
                  align={column.align || "left"}
                  sorted={setSortedValue(column)}
                >
                  {column.render("Header")}
                </DataTableHeadCell>
              ))}
            </TableRow>
          ))}
        </MDBox>

        <TableBody {...getTableBodyProps()}>
          {page.map((row, index) => {
            prepareRow(row);

            // Determines if the row is a parent row
            const isParent = !row.original.parentID || row.original.parentID === "N/A";

            // Checks if the row has child rows
            const hasChildren = data.some(
              (childRow) => childRow.parentID === row.original.uniqueTransactionID
            );

            // Checks if there are any parent rows in the entire dataset
            const hasParentRows = data.some((row) => !row.parentID || row.parentID === "N/A");

            // // Check if the row has a UniqueTransactionID
            // const hasUniqueTransactionID =
            //   row.original.UniqueTransactionID !== null &&
            //   row.original.UniqueTransactionID !== "N/A";

            // const isNotVerificationEmail = row.original.ResourceName != "Verification_Email";
            // console.log("Row Data:", row.original);
            // console.log("Has Children:", hasChildren);
            // console.log("Is Parent:", isParent);
            // console.log("Resource Name:", row.original.resourceName);
            // console.log("Has Unique Transaction ID:", hasUniqueTransactionID);

            return (
              <React.Fragment key={index}>
                {hasParentRows ? (
                  // Render parent rows and their children
                  isParent && (
                    <>
                      <TableRow {...row.getRowProps()} style={sharedRowStyle}>
                        {row.cells.map((cell, idx) => (
                          <DataTableBodyCell
                            key={idx}
                            align={cell.column.align || "left"}
                            noBorder={noEndBorder && rows.length - 1 === index}
                            {...cell.getCellProps()}
                          >
                            {idx === 0 &&
                            hasChildren &&
                            isParent &&
                            row.original.uniqueTransactionID !== null ? (
                              <IconButton
                                onClick={() => toggleRowExpansion(row.original.uniqueTransactionID)}
                              >
                                {expandedRows.includes(row.original.uniqueTransactionID) ? (
                                  <Remove />
                                ) : (
                                  <Add />
                                )}
                              </IconButton>
                            ) : null}
                            {cell.render("Cell")}
                          </DataTableBodyCell>
                        ))}
                      </TableRow>
                      {expandedRows.includes(row.original.uniqueTransactionID) &&
                        data
                          .filter(
                            (childRow) => childRow.parentID === row.original.uniqueTransactionID
                          )
                          .map((childRow, childIndex) => (
                            <TableRow key={childIndex} style={sharedRowStyle}>
                              {columns.map((column, idx) => {
                                const cellContent = (() => {
                                  if (column.accessor === "requestPayload") {
                                    return (
                                      <MDButton
                                        onClick={() =>
                                          openModal("Request Payload", childRow.requestPayload)
                                        }
                                        variant="gradient"
                                        color="info"
                                      >
                                        View Request
                                      </MDButton>
                                    );
                                  }
                                  if (column.accessor === "responsePayload") {
                                    return (
                                      <MDButton
                                        onClick={() =>
                                          openModal("Response Payload", childRow.responsePayload)
                                        }
                                        variant="gradient"
                                        color="info"
                                      >
                                        View Response
                                      </MDButton>
                                    );
                                  }
                                  if (column.accessor === "correlationID") {
                                    return (
                                      <a
                                        href={`#${childRow.correlationID}`}
                                        style={{
                                          color: "blue",
                                          textDecoration: "underline",
                                        }}
                                        onClick={() =>
                                          handleCorrelationIDClick(childRow.correlationID)
                                        }
                                      >
                                        {childRow.correlationID || "N/A"}
                                      </a>
                                    );
                                  }
                                  return childRow[column.accessor] || "N/A";
                                })();
                                return (
                                  <TableCell
                                    key={idx}
                                    align={column.align || "left"}
                                    style={sharedRowStyle}
                                  >
                                    {cellContent}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                    </>
                  )
                ) : (
                  // Render child rows as normal rows if no parent rows exist
                  <TableRow {...row.getRowProps()} style={sharedRowStyle}>
                    {row.cells.map((cell, idx) => (
                      <DataTableBodyCell
                        key={idx}
                        align={cell.column.align || "left"}
                        noBorder={noEndBorder && rows.length - 1 === index}
                        {...cell.getCellProps()}
                      >
                        {cell.render("Cell")}
                      </DataTableBodyCell>
                    ))}
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
      <MDBox
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        p={3}
      >
        {showTotalEntries && (
          <MDTypography variant="button" color="secondary" fontWeight="regular">
            Showing {entriesStart} to {entriesEnd} of {rows.length} entries
          </MDTypography>
        )}
        {pageOptions.length > 1 && (
          <MDPagination
            variant={pagination.variant ? pagination.variant : "gradient"}
            color={pagination.color ? pagination.color : "info"}
          >
            {canPreviousPage && (
              <MDPagination item onClick={() => previousPage()}>
                <Icon sx={{ fontWeight: "bold" }}>chevron_left</Icon>
              </MDPagination>
            )}
            {renderPagination.length > 6 ? (
              <MDBox width="5rem" mx={1}>
                <MDInput
                  inputProps={{
                    type: "number",
                    min: 1,
                    max: customizedPageOptions.length,
                  }}
                  value={customizedPageOptions[pageIndex]}
                  onChange={(e) => {
                    handleInputPagination(e); // This will handle pagination logic
                    handleInputPaginationValue(e); // This will handle value setting correctly
                  }}
                />
              </MDBox>
            ) : (
              renderPagination
            )}
            {canNextPage && (
              <MDPagination item onClick={() => nextPage()}>
                <Icon sx={{ fontWeight: "bold" }}>chevron_right</Icon>
              </MDPagination>
            )}
          </MDPagination>
        )}
      </MDBox>
    </TableContainer>
  );
}

DataTableExpandableRow.defaultProps = {
  entriesPerPage: { defaultValue: 5, entries: [5, 10, 15, 20, 25] },
  canSearch: false,
  showTotalEntries: true,
  pagination: { variant: "gradient", color: "info" },
  isSorted: true,
  noEndBorder: false,
};

DataTableExpandableRow.propTypes = {
  entriesPerPage: PropTypes.oneOfType([
    PropTypes.shape({
      defaultValue: PropTypes.number,
      entries: PropTypes.arrayOf(PropTypes.number),
    }),
    PropTypes.bool,
  ]),
  canSearch: PropTypes.bool,
  showTotalEntries: PropTypes.bool,
  table: PropTypes.shape({
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
  }).isRequired,
  openModal: PropTypes.func.isRequired,
  pagination: PropTypes.shape({
    variant: PropTypes.oneOf(["contained", "gradient"]),
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "light",
    ]),
  }),
  isSorted: PropTypes.bool,
  noEndBorder: PropTypes.bool,
};

export default DataTableExpandableRow;
