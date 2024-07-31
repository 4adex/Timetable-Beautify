async function fetchData(id) {
    const url1 = "https://timetable.iitr.ac.in:4400/api/external/studentscourse";
    const url2 = "https://timetable.iitr.ac.in:4400/api/aao/dep/lecturecoursbatch";
    const url3 = "https://timetable.iitr.ac.in:4400/get/studentsNo/studentcoursetut";

    try {
        // First request to get courses data
        const response1 = await fetch(url1, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                "EnrollmentNo": "23112001",
                "StSessionYear": "2024-25",
                "Semester": "Autumn"
            })
        });

        const courses = (await response1.json()).result;
        const SubBatch = courses[0].SubBatch;

        // Constructing payload for getting L,T,P data
        const newReq = courses.map(course => ({
            "Course_code": course.SubjectCode,
            "Program_id": course.ProgramID,
            "Semester": course.StSemester,
            "Session": course.StSessionYear,
            "SubjectArea": course.SubjectArea,
            "years": course.SemesterID
        }));

        // Requesting for lecture data
        const response2 = await fetch(url2, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newReq)
        });

        const lectureData = (await response2.json()).result;

        const myLecs = lectureData
            .filter(lecture => (lecture.Sub_Batches.includes(SubBatch) || lecture.Sub_Batches==""))
            .map(lecture => ({
                "Course_code": lecture.Course_code,
                "Room_no": lecture.Room_no,
                "Time": lecture.Time,
                "Slot_Type": lecture.Slot_Type,
                "Day": lecture.Day
            }));

        // Constructing payload for tutorial-practical data
        const payload2 = new URLSearchParams({
            "semid": courses[0].SemesterID,
            "SubBatch": SubBatch,
            "Session": courses[0].StSessionYear,
            "Semester": courses[0].StSemester,
            "Branch_Name": courses[0].ProgramID
        });

        // Requesting for tutorial-practical data
        const response3 = await fetch(url3, {
            method: 'POST',
            body: payload2
        });

        const tutData = (await response3.json()).result;

        const myTuts = tutData.map(tut => ({
            "Course_code": tut.subjectAlphaCode,
            "Room_no": tut.LHall,
            "Time": tut.Time,
            "Slot_Type": tut.Slot_Type,
            "Day": tut.Day
        }));

        // Combining lecture and tutorial data
        const data = [...myLecs, ...myTuts];
        console.log(data);
        return data;

    } catch (error) {
        console.error('Error:', error);
    }
}

// fetchData();

async function gethtml(item){
    var type = "";
    if (item.Slot_Type == 'L') {
        type +="lecture";
    }
    else if (item.Slot_Type == "T") {
        type +="tutorial";
    }
    else {
        type +="practical";
    }
    var h = '<div class="'+type+'">'+item.Course_code+' '+item.Room_no+'<br>'+item.Time+'</div>'
    return h;
}

async function UpdateUI(id){
    data = await fetchData(id);
    for (var i=0; i<data.length;i++) {
        var item = data[i];
        var html = await gethtml(item);
        var id = item.Day+item.Time.slice(0,2)
        document.getElementById(id).innerHTML = html;
    }
}

UpdateUI('23112005');
