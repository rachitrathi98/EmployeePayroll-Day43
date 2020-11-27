let empPayrollList;
//To execute Event Listeners when document is loaded
window.addEventListener('DOMContentLoaded', (event) => {
  if (site_properties.use_local_storage.match("true")) {
    getEmployeePayrollDataFromStorage();
  } else getEmployeePayrollDataFromServer();
});

//Get Employee Data from Local Storage into a list
const getEmployeePayrollDataFromStorage = () => {
  empPayrollList =  localStorage.getItem('EmployeePayrollList') ? 
                                 JSON.parse(localStorage.getItem('EmployeePayrollList')) : [];  
  processEmployeePayrollDataResponse();  
}

//Function to pass the employee payroll list to create an HTML Layout
const processEmployeePayrollDataResponse = () => {
  document.querySelector(".emp-count").textContent = empPayrollList.length;
  createInnerHtml();  
  localStorage.removeItem('editEmp');
}

//Get Employee Data from JSON Server into a list using GET request
const getEmployeePayrollDataFromServer = () => {
  makeServiceCall("GET", site_properties.server_url, true)
    .then(responseText => {
      empPayrollList = JSON.parse(responseText);
      processEmployeePayrollDataResponse();  
    })
    .catch(error => {
      console.log("GET Error Status: "+JSON.stringify(error));
      empPayrollList = [];
      processEmployeePayrollDataResponse();  
    });
}

//Created HTML View and displayed employees by iterating over the list
const createInnerHtml = () => {
  const headerHtml = "<th></th><th>Name</th><th>Gender</th><th>Department</th>"+
                     "<th>Salary</th><th>Start Date</th><th>Actions</th>";
  let innerHtml = `${headerHtml}`;
  for (const empPayrollData of empPayrollList) {
    innerHtml = `${innerHtml}
    <tr>
      <td><img class="profile" alt="" 
                src="${empPayrollData._profilePic}">
      </td>
      <td>${empPayrollData._name}</td>
      <td>${empPayrollData._gender}</td>
      <td>${getDeptHtml(empPayrollData._department)}</td>
      <td>${empPayrollData._salary}</td>
      <td>${stringifyDate(empPayrollData._startDate)}</td>
      <td>
        <img id="${empPayrollData.id}" onclick="remove(this)" 
             src="../assets/icons/delete-black-18dp.svg" alt="delete">
        <img id="${empPayrollData.id}" onclick="update(this)" 
             src="../assets/icons/create-black-18dp.svg" alt="edit">
      </td>
    </tr>
    `;
  }
  document.querySelector('#table-display').innerHTML = innerHtml;
}

//Getting the checked department from the list of department
const getDeptHtml = (deptList) => {
  let deptHtml = '';
  for (const dept of deptList) {
      deptHtml = `${deptHtml} <div class='dept-label'>${dept}</div>`
  }
  return deptHtml;
}

//For Remove a particular employee using Local Storage or JSON Server when the delete button is clicked 
const remove = (node) => {
  let empPayrollData = empPayrollList.find(empData => empData.id == node.id);
  if (!empPayrollData) return;
  const index = empPayrollList
                .map(empData => empData.id)
                .indexOf(empPayrollData.id);
  empPayrollList.splice(index, 1);
  if (site_properties.use_local_storage.match("true")) {
    localStorage.setItem("EmployeePayrollList", JSON.stringify(empPayrollList));
    document.querySelector(".emp-count").textContent = empPayrollList.length;
    createInnerHtml();  
  } else {
    const deleteURL = site_properties.server_url + empPayrollData.id.toString();
    makeServiceCall("DELETE", deleteURL, true)
      .then(responseText => {      
        document.querySelector(".emp-count").textContent = empPayrollList.length;
        createInnerHtml();  
      })
      .catch(error => {
        console.log("DELETE Error Status: "+JSON.stringify(error));
      });  
  }
}

//Update the Employees when the edit button is clicked 
const update = (node) => {
  let empPayrollData = empPayrollList.find(empData => empData.id == node.id);
  if (!empPayrollData) return;
  localStorage.setItem('editEmp', JSON.stringify(empPayrollData))
  window.location.replace(site_properties.add_emp_payroll_page);
}