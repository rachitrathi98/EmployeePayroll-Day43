let isUpdate = false;//Boolean for update request
let employeePayrollObj = {};//Object for Employees

//To execute Event Listeners when document is loaded
window.addEventListener('DOMContentLoaded', (event) => {
    const name = document.querySelector('#name');
    name.addEventListener('input', function() {
        if(name.value.length == 0) {
            setTextValue('.text-error', "");
            return;
        }
        try {
            checkName(name.value);//Comes from utility.js (Checking if Name matches the given Regex)
            setTextValue('.text-error', "");
        } catch (e) {
            setTextValue('.text-error', e);
        }
    });
    //Event Listener for Date
    const date = document.querySelector('#date');
    date.addEventListener('input', function() {
        let startDate = getInputValueById('#day')+" "+getInputValueById('#month')+" "+
                      getInputValueById('#year') ;
        try {
            checkStartDate(new Date(Date.parse(startDate)));
            setTextValue('.date-error', "");
        } catch (e) {
            setTextValue('.date-error', e);
        }
    });
    //Event Listener for Salary
    const salary = document.querySelector('#salary');
    setTextValue('.salary-output', salary.value);
    salary.addEventListener('input', function() {
        setTextValue('.salary-output', salary.value);
    });
    document.querySelector('.cancelButton').href = site_properties.home_page;//Cancel Button leading to display page
    checkForUpdate();//Check if the user wants to update an exisiting employee
});

//Save Function getting called after pressing Submit Button in the form page
const save = (event) => 
{
    event.preventDefault();
    event.stopPropagation();
    try {
        
        setEmployeePayrollObject(); 
        if (site_properties.use_local_storage.match("true")) {
            createAndUpdateStorage();
            resetForm();
            window.location.replace(site_properties.home_page);
        } else {
            createOrUpdateEmployeePayroll();
        }
    } catch (e) {
        return;
    }
} 

//Posting and Updating employee object to JSON Server
const createOrUpdateEmployeePayroll = () =>  {    
    let postURL = site_properties.server_url;
    let methodCall = "POST";
    if(isUpdate) {
        methodCall = "PUT";
        postURL = postURL + employeePayrollObj.id.toString();
    }
    makeServiceCall(methodCall, postURL, true, employeePayrollObj)
      .then(responseText => {
        resetForm();
        window.location.replace(site_properties.home_page);
      })
      .catch(error => {
        throw error;
      });
}

//Sets the newly submitted values into an object
const setEmployeePayrollObject = () => {
    if(!isUpdate && site_properties.use_local_storage.match("true")) {
        employeePayrollObj.id = createNewEmployeeId();
    }
    employeePayrollObj._name = getInputValueById('#name');
    employeePayrollObj._profilePic = getSelectedValues('[name=profile]').pop();
    employeePayrollObj._gender = getSelectedValues('[name=gender]').pop();
    employeePayrollObj._department = getSelectedValues('[name=department]');
    employeePayrollObj._salary = getInputValueById('#salary');
    employeePayrollObj._note = getInputValueById('#notes');
    let date = getInputValueById('#day')+" "+getInputValueById('#month')+" "+
               getInputValueById('#year') ;
    employeePayrollObj._startDate = date;
}

//Adds the newly created object into the Local Storage Dictionary
const createAndUpdateStorage = () => {
    let employeePayrollList = JSON.parse(localStorage.getItem("EmployeePayrollList"));
    if(employeePayrollList){
        let empPayrollData = employeePayrollList.
                             find(empData => empData.id == employeePayrollObj.id);
        if (!empPayrollData) {
            employeePayrollList.push(employeePayrollObj);
        } else {
            const index = employeePayrollList
                          .map(empData => empData.id)
                          .indexOf(empPayrollData.id);
            employeePayrollList.splice(index, 1, employeePayrollObj);
        }
    } else{
        employeePayrollList = [employeePayrollObj]
    }
    localStorage.setItem("EmployeePayrollList", JSON.stringify(employeePayrollList))
    alert("Employee added successfully!");

}

//Assigns an employee ID to the newly created object
const createNewEmployeeId = () => {
    let empID = localStorage.getItem("EmployeeID");
    empID = !empID ? 1 : (parseInt(empID)+1).toString();
    localStorage.setItem("EmployeeID",empID);
    return empID;
}
           
//Retrieves the checked items from the form fields after submitting
    const getSelectedValues = (propertyValue) =>
    {
        let allItems = document.querySelectorAll(propertyValue); 
        let sellItems = [];
        allItems.forEach(item => 
        {
            if(item.checked) 
            sellItems.push(item.value);
        });
        return sellItems;
    }
     //Retrieves the element by value from the form fields after submitting       
    const getInputElementValue = (id) =>
    {
        let value = document.querySelector(id).value;
        return value; 
    }
    
    //Retrieves the element by ID from the form fields after submitting       
    const getInputValueById=(id)=>
    {
        let value=document.querySelector(id).value;
        return value;
    }
    
    //Reset Form Function used to set deafult values in tkhe form
    const resetForm = () =>
    { 
        setValue('#name',''); 
        unsetSelectedValues('[name=profile]'); 
        unsetSelectedValues('[name=gender]'); 
        unsetSelectedValues('[name=department]'); 
        setValue('#salary', ' '); 
        setValue('#notes',' ');
        document.querySelector('.text-error').textContent = "";
        document.querySelector('.date-error').textContent = "";
    }
           
    //Unselects the value when the reset form request is recieved
    const unsetSelectedValues = (propertyValue) => 
    { 
        let allItems = document.querySelectorAll(propertyValue); 
        allItems.forEach(item => { item.checked = false; }
            );
    } 
      
    //Sets the values to the right of the input fields (Used for Salary and Error Display)
    const setTextValue = (id, value) => 
    {
        const element = document.querySelector(id); 
        element.textContent = value; 
    } 
    
    //Sets the value in the form 
    const setValue = (id, value) =>
    {
        const element = document.querySelector(id);
        element.value = value; 
    }

    //Check if an update request is received
    const checkForUpdate = () => {
        const employeePayrollJson = localStorage.getItem('editEmp');
        isUpdate = employeePayrollJson ? true : false;
        if (!isUpdate) return;
        employeePayrollObj = JSON.parse(employeePayrollJson);
        setForm();
    }

    //Sets the form values when an update request is received
    const setForm = () => {
        setValue('#name', employeePayrollObj._name);
        setSelectedValues('[name=profile]', employeePayrollObj._profilePic);
        setSelectedValues('[name=gender]', employeePayrollObj._gender);
        setSelectedValues('[name=department]', employeePayrollObj._department);
        setValue('#salary',employeePayrollObj._salary);
        setTextValue('.salary-output', employeePayrollObj._salary);
        setValue('#notes',employeePayrollObj._note);
        let date = stringifyDate(employeePayrollObj._startDate).split(" ");
        setValue('#day', date[0]);
        setValue('#month',date[1]);
        setValue('#year',date[2]);
    }

    //Function to set the values
    const setSelectedValues = (propertyValue, value) => {
        let allItems = document.querySelectorAll(propertyValue);
        allItems.forEach(item => {
            if(Array.isArray(value)) {
                if (value.includes(item.value)) {
                    item.checked = true;
                }
            }
            else if (item.value === value)
                item.checked = true;
        });    
    }
   
           