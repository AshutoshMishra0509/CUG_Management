import { Outlet } from "react-router-dom";
import "./allocationRepo.css";
import { useState, useEffect } from "react";
import { getDatabase, onValue, ref } from "firebase/database";
import Fapp from "../firebase";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Header from "../Header";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

// --------------Report Format Using React PDF----------------
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  header: {
    textAlign: "center",
  },
  subHeader: {
    textAlign: "center",
    marginBottom: 10,
  },
  smallText: {
    textAlign: "center",
    fontSize: 10,
    marginBottom: 10,
  },
  table: {
    display: "table",
    width: "100%",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "33%",
  },
  tableColHeader: {
    width: "33%",
    borderStyle: "solid",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  tableCellRight: {
    margin: 5,
    fontSize: 10,
    textAlign: "right",
  },
  footer: {
    marginTop: 5,
  },
  footerText: {
    fontSize: 9,
    marginTop: 4,
    marginLeft: 10,
  },
  footerTextBold: {
    fontSize: 10,
    fontWeight: "bolder",
  },
  horizontalLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  extraHL: {
    borderBottomWidth: 1,
    marginTop: 2,
    marginBottom: 2,
    borderBottomColor: "#000",
    width: "30%",
    marginLeft: "350",
  },
  footerPText: {
    fontSize: 10,
    textAlign: "left",
    marginTop: 20,
    marginBottom: 25,
  },
  footerSign: {
    fontSize: 11,
    textAlign: "right",
    marginRight: "40",
  },
  footerSignText: {
    fontSize: 11,
    textAlign: "right",
    marginRight: "30",
    marginBottom: "10",
  },
  footerPassed: {
    fontSize: 11,
    textAlign: "left",
    marginLeft: "20",
    marginBottom: "10",
  },
  footerGross: {
    fontSize: 11,
    textAlign: "left",
    marginLeft: "20",
    marginBottom: "2",
  },
  footerDeduction: {
    fontSize: 11,
    textAlign: "left",

    marginBottom: "2",
  },
  footerAfter: {
    fontSize: 11,
    textAlign: "left",
    marginLeft: "16",
    marginBottom: "2",
  },
  footerGST: {
    fontSize: 11,
    textAlign: "left",
    marginLeft: "60",
    marginBottom: "2",
  },
  footerLine: {
    borderBottomWidth: 1,
    marginTop: 2,
    marginBottom: 2,
    borderBottomColor: "#000",
    marginLeft: "20",
    width: "30%",
  },
  footerTotal: {
    fontSize: 11,
    textAlign: "left",
    marginLeft: "20",
    marginBottom: "20",
  },
  footerExtrsSign: {
    fontSize: 11,
    textAlign: "right",
  },
  footerExtrsSignText: {
    fontSize: 11,
    textAlign: "right",
    marginRight: "10",
  },
});

const MyDocument = ({ allocationTotals }) => {
  console.log(allocationTotals);
  // ------calculating Date
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const currentMonth = now.toLocaleString("default", { month: "long" });
  const currentYear = now.getFullYear();
  // ----------Calculating totals
  const grandTotal = allocationTotals.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const Total_Payable = (grandTotal + 2 * (0.09 * grandTotal)).toFixed(2);
  // Arrays for converting numbers into words
  const ones = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ];
  const teens = [
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  // Function to convert a number into words
  const convertToWords = (num) => {
    if (num === 0) return "zero";

    // Splitting number into integer and decimal parts
    const [integerPart, decimalPart] = num.toString().split(".");

    // Converting integer part into words
    const integerWords = convertIntegerToWords(parseInt(integerPart, 10));

    // Converting decimal part into words (if exists)
    let decimalWords = "";
    if (decimalPart) {
      const decimalNumber = parseInt(
        decimalPart.padEnd(2, "0").slice(0, 2),
        10
      ); // Convert up to two decimal places
      decimalWords = ` and ${convertIntegerToWords(decimalNumber)} paisa`;
    }

    return `${integerWords}${decimalWords}`;
  };

  // Function to convert integer part of number into words
  const convertIntegerToWords = (num) => {
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();
    if (num < 1000)
      return `${ones[Math.floor(num / 100)]} hundred ${convertIntegerToWords(
        num % 100
      )}`.trim();
    if (num < 1000000)
      return `${convertIntegerToWords(
        Math.floor(num / 1000)
      )} thousand ${convertIntegerToWords(num % 1000)}`.trim();
    if (num < 1000000000)
      return `${convertIntegerToWords(
        Math.floor(num / 1000000)
      )} million ${convertIntegerToWords(num % 1000000)}`.trim();
    return "overflow";
  };

  // Convert the number to words
  const words = convertToWords(Total_Payable);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>East Coast Railway Bhubaneswar</Text>
        <Text style={styles.subHeader}>Consolidated CUG Bill</Text>
        <Text style={styles.smallText}>
          For the Month of : {currentMonth} {currentYear}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Allocation</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCell}>Date</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellRight}>Amount</Text>
            </View>
          </View>
          {allocationTotals.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.allocationNo}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}> {dateStr} </Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCellRight}>
                  {item.total.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.horizontalLine} />

        <View style={styles.footer}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.footerTextBold}>BBS/HQ/CSTE/CUG/</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.footerTextBold}>DATE:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.footerTextBold}>
                Grand Total: &nbsp; &nbsp; &nbsp; {grandTotal.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol} />
            <View style={styles.tableCol} />
            <View style={styles.tableCol}>
              <Text style={styles.footerText}>
                CGST RS. &nbsp; &nbsp; &nbsp; {(0.09 * grandTotal).toFixed(2)}{" "}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol} />
            <View style={styles.tableCol} />
            <View style={styles.tableCol}>
              <Text style={styles.footerText}>
                SGST RS. &nbsp; &nbsp; &nbsp; {(0.09 * grandTotal).toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.extraHL} />
          <View style={styles.extraHL} />
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, flex: 2 }} />
            <View style={styles.tableCol}>
              <Text style={styles.footerTextBold}>
                Total Payable: &nbsp; {Total_Payable}
              </Text>
            </View>
          </View>
          <Text style={styles.footerPText}>
            Passed for Rs. {Total_Payable} ({words}) and forwarded to FA &
            CAO/X/BBS for audit and arranging the payment of net amount rs.{" "}
            {Total_Payable}
          </Text>
          <Text style={styles.footerSign}> Fo PCSTE/ECoR</Text>
          <Text style={styles.footerSignText}> ECo Rly, Bhubaneswar</Text>
          <Text style={styles.footerPassed}>Passed for ({words})</Text>
          <Text style={styles.footerGross}>
            {" "}
            Gross Amount Rs. &nbsp; &nbsp; &nbsp; {grandTotal.toFixed(2)}
          </Text>
          <Text style={styles.footerDeduction}>
            {" "}
            Deduction Amount Rs. &nbsp; &nbsp; &nbsp; 0
          </Text>
          <Text style={styles.footerAfter}>
            {" "}
            After Desuction Rs. &nbsp; &nbsp; &nbsp; {grandTotal.toFixed(2)}
          </Text>
          <Text style={styles.footerGST}>
            {" "}
            CGST Rs. &nbsp; &nbsp; &nbsp; {(0.09 * grandTotal).toFixed(2)}
          </Text>
          <Text style={styles.footerGST}>
            {" "}
            SGST Rs. &nbsp; &nbsp; &nbsp; {(0.09 * grandTotal).toFixed(2)}
          </Text>
          <View style={styles.footerLine} />
          <Text style={styles.footerTotal}>
            {" "}
            Total Payable Rs. &nbsp; &nbsp; &nbsp; {Total_Payable}
          </Text>
          <Text style={styles.footerExtrsSign}>
            {" "}
            For FA & CA (Expenditure){" "}
          </Text>
          <Text style={styles.footerExtrsSignText}> ECo Rly, Bhubaneswar</Text>
        </View>
      </Page>
    </Document>
  );
};
// ----------Main Function----------
const AllocationReport = () => {
  const db = getDatabase(Fapp);
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState("");
  const [Allocation, setAllocation] = useState("");
  const [AllocationDetails, setAllocationDetails] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [error, setError] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [allocationTotals, setAllocationTotals] = useState([]);
  // ---------Feching Bills------
  useEffect(() => {
    const fetchBills = () => {
      const billRef = ref(db, "CUGBILL/");
      onValue(billRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const billList = Object.keys(data);
          setBills(billList);
        } else {
          setBills([]);
        }
      });
    };
    fetchBills();
  }, [db]);
  // ----------------------------
  const handleSearch = async (event) => {
    event.preventDefault();
    if (Allocation === "" || selectedBill === "") {
      alert("Please Enter a valid Allocation Number and Select a Bill");
      return;
    }

    const allocationRef = ref(db, "Employees3/");
    const cugBillRef = ref(db, `CUGBILL/${selectedBill}/`);

    const fetchEmployees = new Promise((resolve, reject) => {
      onValue(allocationRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const filteredDetails = Object.values(data).filter((item) => {
            const isMatchingAllocation =
              item.Employee_AllocationNo === Allocation;
            const isMatchingPlan =
              selectedPlan === "All" || item.Employee_Plan === selectedPlan;
            const isActive = item.status === "Active";
            return isMatchingAllocation && isMatchingPlan && isActive;
          });
          resolve(filteredDetails);
        } else {
          reject("No Allocation unit found");
        }
      });
    });

    const fetchCugBill = new Promise((resolve, reject) => {
      onValue(cugBillRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          resolve(data);
        } else {
          reject("No CUG Bill data found");
        }
      });
    });

    try {
      const [employees, cugBill] = await Promise.all([
        fetchEmployees,
        fetchCugBill,
      ]);

      if (employees.length === 0) {
        setError(
          "No Allocation unit found or no employees found for the selected plan."
        );
        setAllocationDetails([]);
        setTotalAmount(0);
        return;
      }

      const updatedDetails = employees.map((employee) => {
        const cugBillEntry = cugBill[employee.Employee_CUG];
        if (cugBillEntry) {
          return {
            ...employee,
            total: cugBillEntry.Total,
          };
        } else {
          return {
            ...employee,
            total: 0,
          };
        }
      });

      setAllocationDetails(updatedDetails);
      setError(null);
      const total = updatedDetails.reduce(
        (sum, item) => sum + parseFloat(item.total),
        0
      );
      setTotalAmount(total);
    } catch (err) {
      setError(err);
      setAllocationDetails([]);
      setTotalAmount(0);
    }
  };
  console.log(allocationTotals);
  // Fetch allocation totals for generating report
  useEffect(() => {
    const fetchAllocationTotals = async () => {
      const allocationRef = ref(db, "Employees3/");
      const cugBillRef = ref(db, `CUGBILL/${selectedBill}/`);

      const fetchEmployees = new Promise((resolve, reject) => {
        onValue(allocationRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const activeEmployees = Object.values(data).filter(
              (item) => item.status === "Active"
            );
            resolve(activeEmployees);
          } else {
            reject("No data found in Employees3");
          }
        });
      });

      const fetchCugBill = new Promise((resolve, reject) => {
        onValue(cugBillRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            resolve(data);
          } else {
            reject("No data found in CUGBILL");
          }
        });
      });

      try {
        const [employees, cugBill] = await Promise.all([
          fetchEmployees,
          fetchCugBill,
        ]);

        // Create a mapping of CUG numbers to their totals
        const cugTotals = {};
        Object.keys(cugBill).forEach((cugNo) => {
          cugTotals[cugNo] = cugBill[cugNo].Total;
        });

        // Group employees by allocation number and sum their totals
        const allocationMap = {};
        employees.forEach((employee) => {
          const allocationNo = employee.Employee_AllocationNo;
          const employeeTotal = parseFloat(
            cugTotals[employee.Employee_CUG] || 0
          );

          if (!allocationMap[allocationNo]) {
            allocationMap[allocationNo] = 0;
          }
          allocationMap[allocationNo] += employeeTotal;
        });

        const allocationTotalsArray = Object.keys(allocationMap).map(
          (allocationNo) => ({
            allocationNo,
            total: allocationMap[allocationNo],
          })
        );

        setAllocationTotals(allocationTotalsArray);
      } catch (err) {
        setError(err);
      }
    };

    fetchAllocationTotals();
  }, [db, selectedBill]);

  return (
    <>
      <main className="allocation_Repo">
        <Header />
        <br />
        <h1>Allocation Wise Report</h1>
        <br />
        <form className="row g-3">
          <div className="col-3">
            <label htmlFor="inputbillUnit" className="form-label">
              Allocation Unit
            </label>
            <input
              type="text"
              className="form-control form-control"
              id="inputbillUnit"
              value={Allocation}
              onChange={(e) => {
                setAllocation(e.target.value);
                setError("");
                setAllocationDetails("");
              }}
            />
          </div>

          <div className="col-3">
            <label htmlFor="inputPlan" className="form-label">
              Plan
            </label>
            <select
              className="form-select form-select"
              id="inputPlan"
              value={selectedPlan}
              onChange={(event) => {
                setSelectedPlan(event.target.value);
                setAllocationDetails("");
              }}
            >
              <option value="All">All</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>
          <div className="col-6">
            <label htmlFor="selectBill" className="form-label">
              Select Bill
            </label>
            <select
              className="form-select "
              id="selectBill"
              value={selectedBill}
              onChange={(e) => {
                setSelectedBill(e.target.value);
                setError("");
              }}
            >
              <option value="">-- Select Bill --</option>
              {bills.map((bill, index) => (
                <option key={index} value={bill}>
                  {bill}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12">
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
        </form>
        <br />
        {error && <div className="alert alert-danger">{error}</div>}
        {AllocationDetails.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th scope="col">Allocation No.</th>
                    <th scope="col">Employee ID</th>
                    <th scope="col">Employee Name</th>
                    <th scope="col">CUG NO.</th>
                    <th scope="col">Department</th>
                    <th scope="col">Operator</th>
                    <th scope="col">Plan</th>
                    <th scope="col">Allotment Date</th>
                    <th scope="col">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {AllocationDetails.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Employee_AllocationNo}</td>
                      <td>{item.Employee_Id}</td>
                      <td>{item.Employee_Name}</td>
                      <td>{item.Employee_CUG}</td>
                      <td>{item.Employee_Dept}</td>
                      <td>{item.Employee_Operator}</td>
                      <td>{item.Employee_Plan}</td>
                      <td>{item.createdAt}</td>
                      <td>{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <br />
            <p className="total-amount">
              <strong>Grand Amount:</strong> {totalAmount}
            </p>
            <div className="row">
              <div className="col-2">
                <button className="btn btn-success">
                  <PDFDownloadLink
                    document={
                      <MyDocument allocationTotals={allocationTotals} />
                    }
                    fileName="CUG_Bill.pdf"
                    className="generateRepo"
                  >
                    {({ blob, url, loading, error }) =>
                      loading ? "Loading document..." : "Generate Report"
                    }
                  </PDFDownloadLink>
                </button>
              </div>
            </div>
          </>
        )}
      </main>
      <Outlet />
    </>
  );
};

export default AllocationReport;
