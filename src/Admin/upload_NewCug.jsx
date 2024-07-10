import { useState } from "react";
import { getDatabase, ref, set } from "firebase/database";
import * as XLSX from "xlsx";
import Fapp from "../firebase";
import { Outlet } from "react-router-dom";
import Header from "../Header";
const UploadCUG = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [rowsAdded, setRowsAdded] = useState(0);
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setData(sheetData);
      };
      reader.readAsBinaryString(file);
    }
  };
  //   -------------Logic for Handling Submit Button----------------
  const handleSubmit = (event) => {
    event.preventDefault();
    const db = getDatabase(Fapp);

    // Check if data is available
    if (data.length <= 1) {
      setError("No data to submit");
      return;
    }

    // Remove the header row
    const [header, ...rows] = data;

    // Check if header columns are correct
    const expectedHeader = [
      "CUG NO",
      "EMP NO",
      "NAME",
      "DESIGNATION",
      "UNIT",
      "Dept",
      //   "Division",
      "BillUnitNo",
      "Allocation",
      "OPERATOR",
      "PLAN",
    ];

    if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) {
      setError("Invalid file format");
      return;
    }

    // Iterate over the rows and submit each entry to Firebase
    let rowsCount = 0;
    rows.forEach((row) => {
      const [
        cugNo,
        empNo,
        empName,
        designation,
        division,
        department,
        billUnit,
        allocationUnit,
        operator,
        plan,
      ] = row;

      // if (
      //   cugNo === " " ||
      //   empNo === " " ||
      //   empName === " " ||
      //   designation === " " ||
      //   division === " " ||
      //   department === " " ||
      //   billUnit === " " ||
      //   allocationUnit === " " ||
      //   operator === " " ||
      //   plan === " "
      // )
      if (
        !cugNo ||
        !empNo ||
        !empName ||
        !designation ||
        !division ||
        !department ||
        !billUnit ||
        !allocationUnit ||
        !operator ||
        !plan
      ) {
        setError("Some rows have missing fields");
        return;
      }

      const newCugRef = ref(db, `Employees3/${empNo}`);
      set(newCugRef, {
        Employee_Name: empName,
        Employee_CUG: cugNo,
        Employee_Id: empNo,
        Employee_Designation: designation,
        Employee_Division: division,
        Employee_Dept: department,
        Employee_Operator: operator,
        Employee_BillUnit: billUnit,
        Employee_AllocationNo: allocationUnit,
        Employee_Plan: plan,
        createdAt: new Date().toLocaleString(),
        returnedAt: "",
        status: "Active",
      })
        .then(() => {
          setError(""); // Clear any previous errors
          rowsCount++;
          setRowsAdded(rowsCount);
        })
        .catch((err) => {
          setError(`Error submitting data: ${err.message}`);
        });
    });

    alert("Data Submitted Successfully");
  };

  return (
    <>
      <main className="uploadCugNo">
        <Header />
        <br />
        <h1>Upload CUG Number</h1>
        <br />
        <label htmlFor="inputFile" className="form-label">
          Please Upload the CUG Number. &#40; File Should be in .XLSX Format!
          &#41;
        </label>
        <input
          type="file"
          accept=".xlsx"
          className="form-control"
          id="inputFile"
          onChange={handleFileUpload}
        />
        <br />
        {error && <div className="alert alert-danger">{error}</div>}
        {data.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="table table-bordered ">
                <thead>
                  <tr>
                    {data[0].map((col, index) => (
                      <th key={index}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <br />
            <button className="btn btn-primary" onClick={handleSubmit}>
              Upload
            </button>
            <br />
            {rowsAdded > 0 && (
              <>
                <br />
                <div className="alert alert-success">
                  {rowsAdded} rows successfully added to the database.
                </div>
              </>
            )}
          </>
        )}
      </main>
      <Outlet />
    </>
  );
};

export default UploadCUG;
