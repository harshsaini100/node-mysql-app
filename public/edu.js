function addField() {

    let eduTable = document.getElementById('tbody_2')
    let lt = eduTable.children.length



    if (lt === 2) {

        return
    }

    let tr = document.createElement('tr')
    tr.innerHTML = ` 
    <th scope="row" id='row_${this.parentElement}' value='${lt + 1}'>${lt + 1}</th>
    <td><select class='form-control' id="course_${lt + 1}" value='' data-identifier='Course' oninput="onChange(this)" onclick='abc(this)' data-ref = ${lt+1}>
    <option value=''>--Select a Course--</option>
    <option value='10th' id='10th_${lt + 1}'>10th</option>
    <option value='12th' id='12th_${lt + 1}'>12th</option>
    </select></td>
    <td><input type="text" class='form-control' id="stream_${lt + 1}" value ='' data-identifier='Stream' oninput="onChange(this)"></td>
    <td><input type="number" class='form-control' id="passing_${lt + 1}" value = '' data-identifier='Passing Year' onkeydown='preventKey_two(event)' oninput="onChange(this)"></td>
    <td><input type="number" class='form-control' id="mark_${lt + 1}"  data-identifier='Marks' onkeydown='preventKey(event)' oninput="onChange(this)" value></td>
    <td><button type="button" class="btn btn-primary" value='btn_${lt + 1}' onclick=removeEdu(this)>Remove</button></td>
    <td><input type="hidden" value='${lt + 1}' id="hidden_${lt + 1}" style=""></td>
`
    eduTable.appendChild(tr)


}

function abc(data){
    let eduTable = document.getElementById('tbody_2')
    let lt = eduTable.children.length

    if(lt === 2){
        
       let cValue = document.getElementById('course_1').value
       if(cValue === '12th'){
        document.getElementById('course_2').value = '10th'
        document.getElementById('12th_2').disabled = true
        document.getElementById('10th_2').disabled = true
        document.getElementById('12th_1').disabled = false
        document.getElementById('10th_1').disabled = false
       }else if(cValue === '10th'){
        document.getElementById('course_2').value = '12th'
        document.getElementById('10th_2').disabled = true
        document.getElementById('12th_2').disabled = true
        document.getElementById('12th_1').disabled = false
        document.getElementById('10th_1').disabled = false
       }
      
    }


}

function removeEdu(data) {

    data.parentElement.parentElement.remove()

    let eduTable = document.getElementById('tbody_2')

   
    if (eduTable.childElementCount > 0) {

        for (let i = 0; i < eduTable.childElementCount; i++) {

            eduTable.children[i].children[0].textContent = i + 1;
            eduTable.children[i].children[1].children[0].id = `course_${i + 1}`;
            eduTable.children[i].children[1].children[0].children[1].id = `10th_${i + 1}`;
            eduTable.children[i].children[1].children[0].children[2].id = `12th_${i+1}`

        }
      
    }
   
}



function eduValidation() {

    let eduTable = document.getElementById('tbody_2')
    let eduArray = []
    let erMsg = []
    let erCont = document.getElementById('error')
    let lt = eduTable.childElementCount
    if (lt <= 0 || lt === undefined) {
        eduArray = false
        a = false
    }
    for (let i = 0; i < lt; i++) {

        var a = {
            course: '',
            stream: '',
            passout: '',
            marks: '',
            id: ''
        }

        for (let j = 1; j < 7; j++) {

            if (eduTable.children[i].children[j].children[0].value === '') {

                eduArray = false
                a = false

                eduTable.children[i].children[j].children[0].style.border = '1px solid red'
                erMsg.push(eduTable.children[i].children[j].children[0].dataset.identifier + ` at line ` + eduTable.children[i].children[j].parentElement.children[0].textContent + ' not filled')

            } else {
                if (j !== 5 && a !== false) {
                    //adding education fields
                    switch (j) {
                        case 1:
                            a.course = eduTable.children[i].children[j].children[0].value;
                            break;
                        case 2:
                            a.stream = eduTable.children[i].children[j].children[0].value;
                            break;
                        case 3:
                            a.passout = eduTable.children[i].children[j].children[0].value;
                            break;
                        case 4:
                            a.marks = eduTable.children[i].children[j].children[0].value;
                            break;
                        case 6:
                            a.id = eduTable.children[i].children[j].children[0].value;
                            break;
                    }

                }

            }

        }

        if (a !== false) {
            eduArray.push(a)
        }

    }
    if (a !== false) {

        let x = checkMarks(eduArray)
        if (x !== true) {
            return x
        } else {
            return eduArray
        }
    } else {

        erCont.innerHTML = ''
        erMsg.forEach((e) => {
            let erLi = document.createElement('li')
            erLi.innerHTML = e
            erCont.appendChild(erLi)

        })


    }

    return eduArray

}


function checkMarks(data) {
    let tOf = []
    let yrChkAr = []
    let date = new Date()
    let currentYear = date.getFullYear()
    let x
    let cont = document.getElementById('er_ul')
    cont.innerHTML = ''
    document.getElementById('eduError').innerHTML = ''
    data.forEach((e) => {

        if (e.passout < 1950 || e.passout > currentYear) {
            document.getElementById('eduError').innerHTML = ''
            yrChkAr.push(false)
            let cont = document.getElementById('er_ul')
            let li = document.createElement('li')
            li.innerHTML = `Passing Year should only be between 1950 - ${currentYear} for course name: ` + e.course
            cont.appendChild(li)

            let yearNodes = document.querySelectorAll(`[data-identifier='Passing Year']`)

            yearNodes.forEach((element) => {

                if (element.value == e.passout) {
                    element.style.border = '1px solid red'
                }

            })
        }

    })

    data.forEach(element => {
        if (element.marks <= 0 || element.marks > 100 || isNaN(element.marks) === true) {

            tOf.push(false)
            let cont = document.getElementById('er_ul')
            let li = document.createElement('li')
            li.innerHTML = "marks not valid for course name " + element.course
            cont.appendChild(li)
            let markNodes = document.querySelectorAll(`[data-identifier='Marks']`);
            markNodes.forEach((e) => {

                if (e.value == element.marks) {
                    e.style.border = '1px solid red'
                }

            })
        } else {
            tOf.push(true)
        }
    });
    if (tOf.includes(false) || yrChkAr.includes(false)) {
        x = "Yr or Mk error"
    } else {
        x = true
    }
    return x
}


function populateEducation(data) {

    for (let i = 1; i < data.length; i++) {


        addField()

        document.getElementById(`course_${i}`).value = data[i].course
        document.getElementById(`stream_${i}`).value = data[i].stream
        document.getElementById(`passing_${i}`).value = data[i].passingYear
        document.getElementById(`mark_${i}`).value = data[i].marks
        document.getElementById(`hidden_${i}`).value = data[i].id


    }


}


function preventKey(event) {

    let keycode = event.keyCode || event.which

    if (!((keycode >= 48 && keycode <= 57) || (keycode >= 96 && keycode <= 105) || keycode === 190 || keycode === 46 || keycode === 8 || keycode === 110)) {

        event.preventDefault()
    }

}

function preventKey_two(event) {
    let input = event.target.value;

    let keycode = event.keyCode || event.which

    if (!((keycode >= 48 && keycode <= 57) || (keycode >= 96 && keycode <= 105) || keycode === 46 || keycode === 8)) {
        event.preventDefault()
    } else if (input.length > 3) {


        if (!(keycode === 46 || keycode === 8)) {

            event.preventDefault()
        }


    }


}

function onChange(data) {
    data.style.border = ''
}
