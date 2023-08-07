let formElements = document.querySelectorAll('#myform input, #myform select')
let fName = document.getElementById("fName")
let lName = document.getElementById("lName")
let bDay = document.getElementById("bDay")
let email = document.getElementById("email")
let select = document.getElementById("class")
let radio = document.getElementsByName("enable")
let hiddenInput = document.getElementById("hidden")
let theButton = document.getElementById("btn")
let pword = document.getElementById('pWord')
let searchBox = document.getElementById('search')

//getting home page

function getHome() {


    const xhr = new XMLHttpRequest();

    xhr.open('GET', 'http://localhost:5000/', true)

    xhr.onload = function () {

        if (xhr.status === 200) {
            window.location.href = '/'


        } else {
            console.log("cant redirect home");
        }

    }
    xhr.send()

}

//Add or save form data



function saveData() {
    let emptyFlds = []
    let erCont = document.getElementById('error')
    let er3Cont = document.getElementById('er_ul')
    let er2Cont = document.getElementById('eduError')
    erCont.innerHTML = ''
    er2Cont.innerHTML = ''
    er3Cont.innerHTML = ''


    let filled = true
    for (let i = 0; i < formElements.length; i++) {
        let ele = formElements[i]
        if (ele.value.trim() === "") {
            filled = false;
            emptyFlds.push(`${ele.labels[0].innerHTML} has not been filled`)
            ele.style.border = '1px solid red'

        }
    }

    let fNameValue = fName.value.trim()
    let lNameValue = lName.value.trim()
    let bDayValue = bDay.value
    let emailValue = email.value.trim()
    let selectValue = select.value

    if (ValidateEmail(emailValue))
        if (!checkPassword(pword.value)) {

            formElements[5].style.border = '1px solid red'

            alert("Password should contain at least 8 character with at least 1 character which is a Number,Uppercase, Lowercase and Special Character")

            return
        }


    let courseDetails = eduValidation()

    if (courseDetails === false || courseDetails === undefined) {
        document.getElementById('eduError').innerHTML = 'Please fill Education details!'
        filled = false
    }


    if (courseDetails === "Yr or Mk error") {
        document.getElementById('eduError').innerHTML = ''
        filled = false
    }


    if (filled) {
        document.getElementById('eduError').innerHTML = ''
        for (let i = 0; i < radio.length; i++) {
            let a = 0;
            if (radio[i].checked) {
                var value = radio[i].value

            }
        }


        const xhr = new XMLHttpRequest()

        xhr.open('POST', 'http://localhost:5000/save', true)

        xhr.setRequestHeader("Content-Type", "application/json")

        xhr.upload.onprogress = function () {
            button = document.getElementById("btn")
            button.innerHTML = "Submitting Data. Please Wait"
        }

        xhr.onload = function () {

            if (this.status === 400) {
                console.log('email already exists');
                alert("email already exists")
                document.getElementById('email').style.border = `1px solid red`
                button.innerHTML = "Submit"
            }
            if (this.status === 200) {
                console.log(xhr.response)
                button.innerHTML = "Submit"

                formElements.forEach(singleInput => {
                    if (singleInput.id !== 'yes' && singleInput.id !== 'no') {
                        singleInput.value = ''
                    }
                })


                getHome()


            } else {
                console.log('some error occured');
            }
        }

        let data = {
            fName: fNameValue,
            lName: lNameValue,
            email: emailValue,
            select: selectValue,
            value: value,
            bDay: bDayValue,
            courseDetails: courseDetails
        }

        xhr.send(JSON.stringify(data))
    }
    else {

        emptyFlds.forEach((e) => {

            let erLi = document.createElement('li')
            erLi.innerHTML = e
            erCont.appendChild(erLi)

        })


    }
}

//password validation

function checkPassword(str) {
    var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    return re.test(str);
}


//email validation

function ValidateEmail(input) {

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (input.match(validRegex)) {
        return true;

    } else {

        alert("Invalid email address!");
        formElements[2].style.border = '1px solid red'
        return false;


    }

}


// Feth data from the database

function getData(currentPage) {

    let pageNum = {
        page: currentPage
    }
    try {
        let xhr = new XMLHttpRequest();
       
        xhr.open('POST', '/fetch', true)
        
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
        
        xhr.onload = function () {
          
          
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.response);
                console.log(data);
                displayData(data, currentPage);


            } else {
                console.log("can't get data. error");
             
            }

        }
        
        xhr.send(JSON.stringify(pageNum))
        
    }
    catch (err) {
        alert(JSON.stringify(err))
    }
}


// Delete Data

function deleteRecord(btnData) {
    const response = confirm("Are you sure you want to delete that")
    if (response) {
        confirmDelete(btnData)
    } else {
        return
    }
}

function confirmDelete(btnData) {

    let recordId = btnData.value
    const id = {
        recordId: recordId
    }

    const xhr = new XMLHttpRequest()

    xhr.open('DELETE', '/delete', true)

    xhr.setRequestHeader("Content-Type", "application/json")

    xhr.upload.onprogress = function () {
        console.log("progressing");
    }

    xhr.onload = function () {
        if (xhr.status === 200) {
            console.log("loaded");
            getData(1)
        }

    }

    xhr.send(JSON.stringify(id))
};

//UPDATE DATA 

function editData(btnData) {

    if (btnData === null) {
        return
    }

    let recordId = btnData;

    let id = {
        recordId: recordId
    };

    const xhr = new XMLHttpRequest()

    xhr.open('PUT', '/dataToPopulate', true)

    xhr.setRequestHeader("Content-Type", "application/json")

    xhr.upload.onprogress = function () {
        console.log("update processing")
    }

    xhr.onload = function () {

        let popData = JSON.parse(xhr.response)
        populateForm(popData)


    }

    xhr.send(JSON.stringify(id))




}


// populate form for editing


function populateForm(data) {
    console.log(data);
    fName.value = data[0].firstName
    lName.value = data[0].lasttName
    email.value = data[0].email
    select.value = data[0].class
    bDay.value = data[0].DOB
    hiddenInput.value = data[0].id

    // checking radio button

    radio.forEach((ele) => {
        if (ele.value === `${data[0].isEnable}`)
            ele.checked = true;

    })


    populateEducation(data)


    //change button


    theButton.innerHTML = "Update"
    theButton.onclick = sendAndUpdate


}

function sendAndUpdate() {

    let hiddenInputValue = hiddenInput.value
    let emptyFlds = []
    let erCont = document.getElementById('error')
    let er3Cont = document.getElementById('er_ul')
    let er2Cont = document.getElementById('eduError')
    erCont.innerHTML = ''
    er2Cont.innerHTML = ''
    er3Cont.innerHTML = ''


    let filled = true
    for (let i = 0; i < formElements.length; i++) {
        let ele = formElements[i]
        if (ele.value.trim() === "") {
            filled = false;
            emptyFlds.push(`${ele.labels[0].innerHTML} has not been filled`)

            ele.style.border = '1px solid red'

        }
    }

    let fNameValue = fName.value.trim()
    let lNameValue = lName.value.trim()
    let bDayValue = bDay.value
    let emailValue = email.value.trim()
    let selectValue = select.value

    if (ValidateEmail(emailValue))
        if (!checkPassword(pword.value)) {

            formElements[5].style.border = '1px solid red'

            alert("Password should contain at least 8 character with at least 1 character which is a Number,Uppercase, Lowercase and Special Character")

            return
        }


    let courseDetails = eduValidation()

    if (courseDetails === false || courseDetails === undefined) {
        document.getElementById('eduError').innerHTML = 'Please fill Education details!'
        filled = false
    }


    if (courseDetails === "Yr or Mk error") {
        document.getElementById('eduError').innerHTML = ''
        filled = false
    }

    if (filled) {

        for (let i = 0; i < radio.length; i++) {
            let a = 0;
            if (radio[i].checked) {
                var value = radio[i].value

            }
        }


        const xhr = new XMLHttpRequest()

        xhr.open('PUT', '/update', true)

        xhr.setRequestHeader("Content-Type", "application/json")

        xhr.upload.onprogress = function () {
            button = document.getElementById("btn")
            button.innerHTML = "Submitting Data. Please Wait"
        }

        xhr.onload = function () {

            if (this.status === 400) {

                document.getElementById('error').innerHTML = xhr.response

                button.innerHTML = "Submit"
            }

            if (this.status === 200) {
                console.log("Data saved successfully")
                button.innerHTML = "Submit"

                formElements.forEach(singleInput => {
                    if (singleInput.id !== 'yes' && singleInput.id !== 'no') {
                        singleInput.value = ''
                    }

                })

                getHome()

            } else {
                console.log('some error occured');
            }
        }

        let data = {
            fName: fNameValue,
            lName: lNameValue,
            email: emailValue,
            select: selectValue,
            value: value,
            bDay: bDayValue,
            id: hiddenInputValue,
            eduFields: courseDetails

        }

        xhr.send(JSON.stringify(data))
    }

}

// Display data on the screen

function displayData(data, currentPage) {
    let button = document.getElementById('toForm')
    console.log(data);
    let stArray = Object.values(data)[1]
    let recordNum = Object.values(data)[0]
    let itemsPerPage = Object.values(data)[2]

    let index = (currentPage - 1) * itemsPerPage

    console.log(itemsPerPage);


    let container = document.getElementById("tbody")

    container.innerHTML = ''



    stArray.forEach((ele) => {

        let trow = document.createElement('tr')
        trow.innerHTML = `<th scope="row">${index + 1}</th>
                          <td>${ele.firstName}</td>
                          <td>${ele.lasttName}</td>
                          <td>${ele.email}</td>
                          <td>${ele.class}</td>
                          <td>${ele.DOB}</td>
                          <td>${ele.isEnable}</td>
                          <td>
                          <a class="btn btn-warning me-2" href=/form?id=${ele.id}>Edit</a>
                          <button class="btn btn-danger" onclick="deleteRecord(this)" value=${ele.id}>Delete</button>
                          </td>
                        `
        container.appendChild(trow)
        index++
    })


    setupPagination(recordNum, itemsPerPage)
    document.getElementById(`${currentPage}`).classList.add("active")

}






function addField() {

    let eduTable = document.getElementById('tbody_2')
    let lt = eduTable.children.length

    let tr = document.createElement('tr')
    tr.innerHTML = ` 
    <th scope="row" value=''>${lt + 1}</th>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><input type="text"></td>
    <td><button type="button" class="btn btn-primary" value='' onclick=removeEdu(this)>Remove</button></td>
`
    eduTable.appendChild(tr)
}

function removeEdu(data) {

    data.parentElement.parentElement.remove()

    let eduTable = document.getElementById('tbody_2')

    console.log(eduTable.childElementCount);

    if (eduTable.childElementCount > 0) {

        for (let i = 0; i < eduTable.childElementCount; i++) {

            eduTable.children[i].children[0].textContent = i + 1;


        }

    }
}


function onChange(data) {
    data.style.border = ''
}




function setupPagination(recordNum, itemsPerPage) {



    let totalPages = Math.ceil(recordNum / itemsPerPage)
    let paginationContainer = '#pagination'


    const pagination = document.querySelector(paginationContainer);
    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const listEle = document.createElement("li");
        listEle.classList.add('page-item')
        listEle.id = `${i}`
        let link = document.createElement('a')
        link.classList.add('page-link')
        link.href = `/?id=${i}`
        link.innerText = i;
        listEle.appendChild(link)

        link.addEventListener("click", (event) => {
            event.preventDefault();
            getData(i)

        });
        pagination.appendChild(listEle)
    }
}


//Button Staet

function buttonState(element) {

    if (element.value.length === 0) {
        getData(1)

    } else {

        // document.getElementById('noResult').textContent = ''
        let container = document.getElementById("box").style.display = 'block'
        search()
    }


}


//search 

function search() {

    let value = {
        search: searchBox.value
    }



    let xhr = new XMLHttpRequest();

    xhr.open('POST', '/search', true)

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

    xhr.onload = function () {

        if (xhr.status === 200) {
            let data = JSON.parse(xhr.response);
            console.log(data);
            // displayData(data,1);
            displaySearchResult(data)
            // searchBox.value = ''

        } else {
            console.log("can't get data. error");
        }

    }
    xhr.send(JSON.stringify(value))



}


function displaySearchResult(data) {
    let box = document.getElementById("box")
    let container = document.getElementById("tbody")
    let button = document.getElementById("toForm")
    let pagination = document.getElementById("pagination").innerHTML = ''
    let stArray = data
    // button.innerHTML = 'Home'
    // button.href = '/'
    if (stArray.length === 0) {
        box.style.display = 'none'
        let p = document.getElementById('noResult').textContent = 'No Result'

        return
    }



    container.innerHTML = ''
    document.getElementById('noResult').textContent = ''


    stArray.forEach((ele, index) => {

        let trow = document.createElement('tr')
        trow.innerHTML = `<th scope="row">${index + 1}</th>
                          <td>${ele.firstName}</td>
                          <td>${ele.lasttName}</td>
                          <td>${ele.email}</td>
                          <td>${ele.class}</td>
                          <td>${ele.DOB}</td>
                          <td>${ele.isEnable}</td>
                          <td>
                          <a class="btn btn-warning me-2" href=/form?id=${ele.id}>Edit</a>
                          <button class="btn btn-danger" onclick="deleteRecord(this)" value=${ele.id}>Delete</button>
                          </td>
                        `
        container.appendChild(trow)
        index++
    })



}