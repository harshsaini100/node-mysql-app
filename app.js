const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const { createConnection } = require('net');
const { log } = require('console');
const { connect } = require('http2');
var cors = require('cors');

// use it before all route definitions


const app = express();
app.use(cors({origin: '*'}));

app.use(express.static('public'))
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});


//sql connection


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'harsh_db'
})

//connection

connection.connect((err) => {
    if (err) {
        console.log("error occured")
    } else {
        console.log("connection established")
    }
})


app.post('/save', (req, res) => {
    const data = req.body;

    console.log(data);

    connection.query(`SELECT email FROM customer WHERE email = '${data.email}'`, (err, result) => {

        if (err) throw err
        else {
            if (result.length > 0) {
                res.status(400).send()
            } else {
                setTimeout(writing, 2000)
            }
        }
    })


    function writing() {


        // code for adding from data to database

        return new Promise((res, rej) => {
            let customerId
            let sql = `INSERT INTO customer (firstName,lasttName,email,class,DOB,isEnable) VALUES('${data.fName}','${data.lName}','${data.email}','${data.select}','${data.bDay}','${data.value}')`

            connection.query(sql, (err, result) => {
                if (err) console.log(err);
                else {
                    console.log("1 record inserted");
                   
                    customerId = result.insertId

                }
                res(customerId)
            }
            )

        }).then((id) => {


            console.log(id);
            let courseDetails = data.courseDetails

            courseDetails.forEach((ele) => {


                connection.query(`INSERT INTO user_education (userId,course,stream,passingYear,marks) values (${id},'${ele.course}','${ele.stream}', '${ele.passout}','${ele.marks}') `,
                    (err, result) => {
                        if (err) throw err
                        else {
                            console.log("education details saved");

                        }
                    })
            })

            res.status(200).send("Data saved successfully")

        })

    }
})

// app.get('/fetch', (req, res) => {
//     console.log("fetch reached");
//     getAllCustomers().then(function (userArray) {
//         console.log("user array is");
//         console.log(userArray);
//         res.status(200).send(JSON.stringify(userArray));
//     })

// })

//delete

app.delete('/delete', (req, res) => {

    let recordId = req.body.recordId
    console.log(recordId)

    const deletePromise = new Promise((res, rej) => {

        connection.query(`DELETE FROM customer WHERE id=${recordId}`, (err, result) => {
            if (err) throw err
            else {
                res("deleted");

            }
        })



    })

    deletePromise.then((data) => {
        console.log(data);
        connection.query(`DELETE FROM user_education WHERE userId=${recordId}`, (err, result) => {

            if (err) throw err
            else {
                res.status(200).send()
            }
        })

    })
})

// getting data from database to populate the form

app.put('/dataToPopulate', (req, res) => {

    let recordId = req.body.recordId
    let responseData = []


    console.log(recordId);

    return new Promise((response, reject) => {

        connection.query(`SELECT * FROM customer WHERE id = ${recordId}`, (err, result) => {

            if (err) throw err
            else {
                console.log(result);
                // res.status(200).send(JSON.stringify(result))
                response(result)
            }

        })



    }).then((customerResult) => {


        connection.query(`SELECT * FROM user_education WHERE userId = ${recordId}`, (err, result) => {

            if (err) throw err
            else {
                responseData = [
                    ...customerResult,
                    ...result,

                ]
                res.status(200).send(JSON.stringify(responseData))
                // console.log(responseData);
            }

        })



    })



})

//getting updated data from form and updating the database.

app.put('/update', (req, res) => {


    let data = req.body

    let eduFields = data.eduFields

    let incomingRecordIds = []

    eduFields.forEach((e) => {

        incomingRecordIds.push(e.id)

    })

    if (incomingRecordIds.length <= 0) {
        res.status(400).send("Education filed empty")
    }

    // console.log(incomingRecordIds);


    connection.query(`SELECT email FROM customer WHERE email = '${data.email}' AND id != ${data.id}`, (err, result) => {

        if (err) throw err
        if (result.length > 0) {
            res.status(400).send("Email exists")
        } else {

            let sql = `UPDATE customer SET firstName='${data.fName}', lasttName='${data.lName}', email='${data.email}', class='${data.select}', DOB='${data.bDay}', isEnable='${data.value}' WHERE id = ${parseInt(data.id)}`

            connection.query(sql, (err, result) => {
                if (err) throw err
                else {
                    getIdsfromDb(data, eduFields, incomingRecordIds)

                    res.status(200).send()

                }
            })

        }

    })

})


function getIdsfromDb(data, eduFields, incomingRecordIds) {


    let fullData = data
    let comingEduFields = eduFields
    let incomingIds = incomingRecordIds
    let dbIds = []

    connection.query(`SELECT id FROM user_education WHERE userId = ${fullData.id}`, (err, result) => {


        if (err) throw err
        else {
            result.forEach((e) => {

                dbIds.push(e.id)

            })

            // console.log(dbIds);
            updatingEducationInDb(fullData, comingEduFields, incomingIds, dbIds)

        }


    })

}


function updatingEducationInDb(fullData, comingEduFields, incomingIds, dbIds) {

    let iid = incomingIds.map((e) => {
        return parseInt(e)
    })

    let incIdToNum = iid.sort()
    let dbIdsSorted = dbIds.sort()
    console.log(JSON.stringify(dbIdsSorted) === JSON.stringify(incIdToNum));

    if (incomingIds.length === dbIds.length) {
        if (JSON.stringify(dbIdsSorted) === JSON.stringify(incIdToNum)) {
            extraUpdateEduField(comingEduFields)
        } else {
            let freshIds

            let newEduFields = []
            let oldEduFields = []
            newEduFields = comingEduFields.filter(ele => !dbIds.includes(parseInt(ele.id)))
            oldEduFields = comingEduFields.filter(ele => dbIds.includes(parseInt(ele.id)))

            idsFromDb(fullData).then((ids) => {

                freshIds = ids.map((e) => {
                    return e.id
                })

                let toDelete = freshIds.filter((e) => {
                    return !iid.includes(e)
                })
                console.log(iid);
                console.log(freshIds);
                console.log(toDelete);

                extraUpdateEduField(oldEduFields)
                extraAdNewField(fullData, newEduFields)
                deleteExtra(toDelete);

            })


        }


    }


    else if (incomingIds.length > dbIds.length) {

        let newEduFields = []
        let oldEduFields = []
        newEduFields = comingEduFields.filter(ele => !dbIds.includes(parseInt(ele.id)))
        oldEduFields = comingEduFields.filter(ele => dbIds.includes(parseInt(ele.id)))
        console.log(newEduFields);
        console.log(oldEduFields);


        idsFromDb(fullData).then((id) => {

            let freshIds = id.map((e) => {
                return e.id
            })

            let toDelete = freshIds.filter((e) => {
                return !iid.includes(e)
            })
            extraAdNewField(fullData, newEduFields)
            extraUpdateEduField(oldEduFields)
            deleteExtra(toDelete)

        })



    }

    else if (incomingIds.length < dbIds.length) {



        let presentEduFields = comingEduFields.filter(ele => dbIds.includes(parseInt(ele.id)))
        let notPresentIds = dbIds.filter((ele) => !incomingIds.includes(ele.toString()))
        let incomingIdsNotInDb = incomingIds.filter((e) => {
            return !dbIds.includes(parseInt(e))
        })

        let notPresentEduInDb = comingEduFields.filter((e) => {
            return !dbIds.includes(parseInt(e.id))
        })

        extraAdNewField(fullData, notPresentEduInDb)


        presentEduFields.forEach((ele) => {


            connection.query(`UPDATE user_education SET course='${ele.course}', stream='${ele.stream}', passingYear='${ele.passout}',marks='${ele.marks}' WHERE id=${ele.id}`, (err, result) => {
                if (err) throw err
                else {
                    console.log('updated when fields were deleted in form');
                }
            })



        })


        notPresentIds.forEach((ele) => {

            connection.query(`DELETE FROM user_education WHERE id=${ele}`, (err, result) => {
                if (err) throw err
                else { console.log("extra deleted"); }
            })

        })

    }

}

function extraUpdateEduField(eduFieldData) {



    eduFieldData.forEach((ele) => {


        connection.query(`UPDATE user_education SET course='${ele.course}', stream='${ele.stream}', passingYear='${ele.passout}', marks='${ele.marks}' WHERE id=${ele.id} `, (err, result) => {
            if (err) throw err
            else {
                console.log(result);
            }
        })



    })


}

function extraAdNewField(fullData, newEduFields) {

    newEduFields.forEach((ele) => {


        connection.query(`INSERT INTO user_education (userId, course, stream,passingYear,marks) values (${fullData.id},'${ele.course}','${ele.stream}','${ele.passout}','${ele.marks}')`, (err, result) => {

            if (err) throw err
            else {
                // console.log(result);
            }
        })


    })



}


function idsFromDb(data) {

    return new Promise((response, reject) => {

        connection.query(`SELECT id FROM user_education WHERE userID=${data.id}`, (err, result) => {

            if (err) throw err
            else {
               
                response(result)
            }

        })

    })

}


function deleteExtra(toDelete) {


    toDelete.forEach((e) => {


        connection.query(`DELETE FROM user_education WHERE id=${e}`, (err, result) => {
            if (err) throw result
            else {
                console.log("Sucessfuly updated");
            }
        })



    })



}


app.get('/form', (req, res) => {

    res.sendFile(path.join(__dirname, 'form.html'))


})


// connection.end()




// pagination data

app.post('/fetch', (req, res) => {

    let currentPage = req.body.page
    let itemsPerPage = 2
    const fetchPromise = new Promise((response, reject) => {

        connection.query('SELECT COUNT(id) as count FROM customer', (err, result) => {

            if (err) throw err
            else {
                count = result[0].count
                response(count)
            }

        })
    })

    fetchPromise.then((count) => {
        let numOfPages = Math.ceil(count / itemsPerPage)
        console.log(numOfPages);
        let startIndex = (currentPage - 1) * itemsPerPage;
        let endIndex = startIndex + itemsPerPage

        connection.query(`SELECT * FROM customer LIMIT ${startIndex}, ${itemsPerPage}`, (err, result) => {

            if (err) throw err
            else {
               
                let data = {
                    count: count,
                    result: result,
                    itemsPerPage: itemsPerPage
                }
                res.status(200).send(data)
            }

        })


    })



})


//- SEARCH


app.post('/search',(req,res)=>{

let searchParam = req.body.search
let sql = `SELECT * FROM customer WHERE firstName LIKE '%${searchParam}%' OR lasttName LIKE '%${searchParam}%' OR email LIKE '%${searchParam}%' OR class LIKE '%${searchParam}%' OR DOB LIKE '%${searchParam}%'`
connection.query(sql,(err,result)=>{
  if(err) throw err
  else{
    console.log(result);
    res.status(200).send(result)
  }
})



})


app.get('/merit', (req,res)=>{


    res.sendFile(path.join(__dirname, 'merit.html'))


})


app.post('/meritList', (req,res)=>{

   let percentStart = req.body.percentStart
   let percentEnd = req.body.percentEnd
   let course = req.body.course

   let sql = `SELECT customer.firstName,customer.lasttName,customer.email, user_education.course, user_education.marks
   FROM user_education 
   INNER JOIN customer ON user_education.userId = customer.id WHERE user_education.marks >= ${percentStart} AND user_education.marks <= ${percentEnd} AND user_education.course = '${course}'
         ORDER BY user_education.marks DESC  `

           connection.query(sql, (err,result)=>{


            if(err) throw err
            else{
                console.log(result);
                res.status(200).send(result)
            }


           })


})


//Server

app.listen(5000, () => {
    console.log("server started");
});