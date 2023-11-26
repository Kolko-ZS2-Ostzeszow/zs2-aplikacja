export class ScheduleData {
  hours: { startTime: number; endTime: number }[];
  buildings: { name: string; short: string }[];
  classrooms: { id: number; name: string; short: string; buildingId: number }[];
  classes: { id: number; name: string; teacherId: number }[];
  subjects: { id: number; name: string; short: string }[];
  teachers: { id: number; short: string }[];
  lessons: {
    id: number;
    subjectId: number;
    teacherId: number;
    groupIds: number;
    classIds: number;
    duration: number;
    classroomIds: number;
    hourIds: number;
    dayIds: number;
  }[];
  groups: { id: number; name: string; classId: number; entireClass: boolean }[];
}

const Days = [
  { short: "Pn", name: "Poniedziałek" },
  { short: "Wt", name: "Wtorek" },
  { short: "Śr", name: "Środa" },
  { short: "Czw", name: "Czwartek" },
  { short: "Pi", name: "Piątek" },
];

export async function fetchEdupageData() {
  let fetchedData = await fetch(
    "https://zs2ostrzeszow.edupage.org/timetable/server/regulartt.js?__func=regularttGetData",
    {
      method: "POST",
      body: JSON.stringify({ __args: [null, "201"], __gsh: "00000000" }),
    }
  );

  let fetchedJson = await fetchedData.json();

  let parsedData: ScheduleData = {
    hours: fetchedJson.r.dbiAccessorRes.tables[1].data_rows.map(
      (data: { starttime: string; endtime: string }) => {
        return {
          startTime: data.starttime,
          endTime: data.endtime,
        };
      }
    ),
    buildings: fetchedJson.r.dbiAccessorRes.tables[10].data_rows.map(
      (data: { name: string; short: string }) => {
        return {
          name: data.name,
          short: data.short,
        };
      }
    ),
    classrooms: fetchedJson.r.dbiAccessorRes.tables[11].data_rows.map(
      (data: {
        id: string;
        name: string;
        short: string;
        buildingid: string[];
      }) => {
        return {
          id: parseInt(
            data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)
          ),
          name: data.name,
          short: data.short,
          buildingId: parseInt(data.buildingid[1]) - 1,
        };
      }
    ),
    classes: fetchedJson.r.dbiAccessorRes.tables[12].data_rows.map(
      (data: { id: string; name: string; teacherid: string }) => {
        return {
          id: parseInt(
            data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)
          ),
          name: data.name,
          teacherId: parseInt(data.teacherid),
        };
      }
    ),
    subjects: fetchedJson.r.dbiAccessorRes.tables[13].data_rows.map(
      (data: { id: string; name: string; short: string }) => {
        return {
          id: parseInt(
            data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)
          ),
          name: data.name,
          short: data.short,
        };
      }
    ),
    teachers: fetchedJson.r.dbiAccessorRes.tables[14].data_rows.map(
      (data: { id: string; short: string }) => {
        return {
          id: parseInt(
            data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)
          ),
          short: data.short,
        };
      }
    ),
    lessons: fetchedJson.r.dbiAccessorRes.tables[18].data_rows.map(
      (data: {
        id: string;
        subjectid: string;
        teacherids: string[];
        groupids: string[];
        classids: string[];
        durationperiods: number;
        classroomidss: string[];
      }) => {
        let id = parseInt(
          data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)
        );

        let cards = fetchedJson.r.dbiAccessorRes.tables[20].data_rows.filter(
          (cardsData: { lessonid: string }) => {
            let lessonId = cardsData.lessonid;
            return (
              parseInt(
                lessonId.slice(lessonId.includes("*") ? 1 : 0, lessonId.length)
              ) == id
            );
          }
        );

        return {
          id: id,
          subjectId: parseInt(
            data.subjectid.slice(
              data.subjectid.includes("*") ? 1 : 0,
              data.subjectid.length
            )
          ),
          teacherId: data.teacherids.map((teacherId) => {
            return parseInt(
              teacherId.slice(teacherId.includes("*") ? 1 : 0, teacherId.length)
            );
          })[0],
          groupIds: data.groupids.map((groupId) => {
            return parseInt(
              groupId.slice(groupId.includes("*") ? 1 : 0, groupId.length)
            );
          }),
          classIds: data.classids.map((classId) => {
            return parseInt(
              classId.slice(classId.includes("*") ? 1 : 0, classId.length)
            );
          }),
          duration: data.durationperiods,
          classroomIds: data.classroomidss.map((classroomId) => {
            return parseInt(
              classroomId.slice(
                classroomId.includes("*") ? 1 : 0,
                classroomId.length
              )
            );
          }),
          hourIds: cards.map(
            (data: { period: string }) => parseInt(data.period) - 1
          ),
          dayIds: cards.map((data: { days: string }) => {
            switch (data.days) {
              case "10000":
                return 0;
              case "01000":
                return 1;
              case "00100":
                return 2;
              case "00010":
                return 3;
              case "00001":
                return 4;
              default:
                return -1;
            }
          }),
        };
      }
    ),
    groups: fetchedJson.r.dbiAccessorRes.tables[15].data_rows.map(
      (data: {
        id: string;
        name: string;
        classid: string;
        entireclass: boolean;
      }) => {
        return {
          id: parseInt(
            data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)
          ),
          name: data.name,
          classId: parseInt(data.classid),
          entireClass: data.entireclass,
        };
      }
    ),
  };

  parsedData.groups = parsedData.groups.filter((value: { id: number }) => {
    let usedGroups = [
      ...new Set(
        parsedData.lessons.flatMap((lesson) => {
          return lesson.groupIds;
        })
      ),
    ];
    return usedGroups.includes(value.id);
  });

  return parsedData;
}
