function getMerit(ps,pe){
    let course = document.getElementById('mSelect').value
    let query = {
        percentStart:ps,
        percentEnd: pe,
        course: course
    }

    fetch('/meritList', {
        method: "POST",
     
        // Adding body or contents to send
        body: JSON.stringify(query),
         
        // Adding headers to the request
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    
    })
    .then((data)=>{
       return  data.json()
       
    })
    .then((data)=>{
        console.log(data);
        displayMerit(data)
    })
    .catch((err)=>{
        console.log(err);
    })

}




function displayMerit(data){
   let container = document.getElementById('tbody')

   container.innerHTML = ''

    data.forEach((ele,index) => {

        let trow = document.createElement('tr')
        trow.innerHTML = `<th scope="row">${index + 1}</th>
                          <td>${ele.firstName}</td>
                          <td>${ele.lasttName}</td>
                          <td>${ele.email}</td>
                          <td>${ele.course}</td>
                          <td>${ele.marks}</td>
                         
                        `
        container.appendChild(trow)
        index++
    })



}