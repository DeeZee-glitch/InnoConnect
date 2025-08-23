const mockTableData = {
  columns: [
    {
      Header: "ID",
      accessor: "id",
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Transaction ID",
      accessor: "uniqueTransactionId",
    },
    {
      Header: "Parent ID",
      accessor: "parentId",
    },
  ],
  rows: [
    { id: 1, name: "Row A", uniqueTransactionId: "txn001", parentId: null },
    { id: 2, name: "Row B", uniqueTransactionId: "txn002", parentId: "txn001" },
    { id: 3, name: "Row C", uniqueTransactionId: "txn003", parentId: "txn001" },
    { id: 4, name: "Row D", uniqueTransactionId: "txn004", parentId: null },
    { id: 5, name: "Row E", uniqueTransactionId: "txn005", parentId: "txn004" },
    { id: 6, name: "Row F", uniqueTransactionId: "txn006", parentId: null },
    { id: 7, name: "Row G", uniqueTransactionId: "txn007", parentId: "txn006" },
    { id: 8, name: "Row H", uniqueTransactionId: "txn008", parentId: "txn006" },
  ],
};

export default mockTableData;
