import { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import "./planReport.css";
import Fapp from "../firebase";
import Header from "../Header";
const PlanReport = () => {
  const [bill, setBill] = useState(0); // for toggling view of the Employee
  const [selectedPlan, setSelectedPlan] = useState("");
  const [error, setError] = useState("");
  const [plans, setPlans] = useState([]); // State for storing available plans
  const [PlanDetails, setPlanDetails] = useState([]);
  const [cugBillDetails, setCugBillDetails] = useState({});
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState("");
  const [billCUGNumbers, setBillCUGNumbers] = useState(new Set());
  const [searchCUG, setSearchCUG] = useState(""); // for custom search

  // Firebase database instance setup (replace with your Firebase setup)
  const db = getDatabase(Fapp);
  // Fetching available plans from the database
  useEffect(() => {
    const fetchPlans = () => {
      const planRef = ref(db, "Plan/");
      onValue(planRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const planList = Object.keys(data);
          setPlans(planList);
        } else {
          setPlans([]);
        }
      });
    };
    fetchPlans();
  }, [db]);
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
  // ---------Handling Search--------
  const handleSearch = async (event) => {
    event.preventDefault();
    console.log("Search Clicked");
    if (selectedPlan === "" || selectedBill === "") {
      alert("Please Select a Plan and a Bill");
      return;
    }

    // Fetch CUG numbers for the selected bill
    const cugBillRef = ref(db, `CUGBILL/${selectedBill}`);
    onValue(cugBillRef, (snapshot) => {
      const cugBillData = snapshot.val();
      if (cugBillData) {
        const cugNumbers = new Set(Object.keys(cugBillData));
        setBillCUGNumbers(cugNumbers);
        // console.log("Bill cug Numbers", billCUGNumbers);
        // Fetch employees after setting the CUG numbers
        const planRef = ref(db, "Employees3/");
        onValue(planRef, (snapshot) => {
          const data = snapshot.val();
          console.log("Data", data);
          if (data) {
            const filteredDetails = Object.values(data).filter((item) => {
              const isMatchingplan = item.Employee_Plan === selectedPlan;
              const isActive = item.status === "Active";
              const isInSelectedBill = cugNumbers.has(
                String(item.Employee_CUG)
              );
              return isMatchingplan && isActive && isInSelectedBill;
            });
            if (filteredDetails.length === 0) {
              setError("No employees found for the selected plan.");
              setPlanDetails([]);
            } else {
              setPlanDetails(filteredDetails);
              console.log("Plans", PlanDetails);
              setError(null);
            }
          } else {
            setError("No Data found");
            setPlanDetails([]);
          }
        });
      } else {
        setBillCUGNumbers(new Set());
        setError("No CUG Bill data found");
        setPlanDetails([]);
      }
    });
    console.log(PlanDetails);
  };

  // Fetching CUG Bill details for a specific employee
  const fetchCugBill = (employeeCug) => {
    const cugBillRef = ref(db, `CUGBILL/${selectedBill}/${employeeCug}`);
    onValue(cugBillRef, (snapshot) => {
      const cugBillData = snapshot.val();
      if (cugBillData) {
        setCugBillDetails(cugBillData);
        setBill(1); // Display bill details
      } else {
        setError("No CUG Bill data found");
        setCugBillDetails({});
      }
    });
  };

  // Handling click to view employee bill details
  const handleViewBill = (employeeCug) => {
    try {
      fetchCugBill(employeeCug);
    } catch (err) {
      setError(err.message);
      setCugBillDetails({});
    }
  };
  // Filter the PlanDetails based on the searchCUG
  const filteredPlanDetails = PlanDetails.filter((employee) =>
    employee.Employee_CUG.toString().includes(searchCUG)
  );

  // Rendering component
  return (
    <>
      <main className="planRepo">
        <Header />
        <br />
        <h1>Plan-Wise Billing Report</h1>
        <br />
        <form
          action=""
          className={`row g-3 ${bill === 1 ? "display" : ""}`}
          onSubmit={handleSearch}
        >
          <div className="col-3">
            <label htmlFor="plan" className="form-label">
              Plan
            </label>
            <select
              id="plan"
              className="form-select "
              onChange={(e) => setSelectedPlan(e.target.value)}
            >
              <option value="">--Choose--</option>
              {plans.map((plan, index) => (
                <option key={index} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </div>
          <div className="col-3">
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
          <div className="col-4">
            {PlanDetails.length > 1 && (
              <>
                <label htmlFor="searchCUG" className="form-label">
                  Search CUG
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by CUG No."
                  value={searchCUG}
                  onChange={(e) => setSearchCUG(e.target.value)}
                />
              </>
            )}
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </div>
        </form>
        <br />
        <div className={`table-responsive ${bill === 1 ? "display" : ""}`}>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">Employee ID</th>
                <th scope="col">Employee Name</th>
                <th scope="col">CUG NO.</th>
                <th scope="col">Plan</th>
                <th scope="col">View Bill</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlanDetails.map((employee) => (
                <tr key={employee.Employee_Id}>
                  <td>{employee.Employee_Id}</td>
                  <td>{employee.Employee_Name}</td>
                  <td>{employee.Employee_CUG}</td>
                  <td>{employee.Employee_Plan}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleViewBill(employee.Employee_CUG)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <br />
        {bill === 0 && <p>Number of Employees: {PlanDetails.length} </p>}
        {/* Employee Bill Details */}
        <div
          className={`table-responsive billtable ${
            bill === 0 ? "display" : ""
          }`}
        >
          <button className="btn btn-danger" onClick={() => setBill(0)}>
            Back
          </button>
          <br />
          <br />
          <table className="table table-bordered border-primary">
            <thead>
              <tr>
                <th scope="col">CUG NO.</th>
                <th scope="col">Periodic Charge</th>
                <th scope="col">Amount Usage</th>
                <th scope="col">Amount Data</th>
                <th scope="col">Voice</th>
                <th scope="col">Video</th>
                <th scope="col">SMS</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{cugBillDetails.Employee_CUG}</td>
                <td>{cugBillDetails.Periodic_Charge}</td>
                <td>{cugBillDetails.Amount_Usage}</td>
                <td>{cugBillDetails.Amount_Data}</td>
                <td>{cugBillDetails.Voice}</td>
                <td>{cugBillDetails.Video}</td>
                <td>{cugBillDetails.SMS}</td>
                <td>{cugBillDetails.Total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default PlanReport;
