import parse from "node-html-parser";

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
    groupIds: any[];
    classIds: number[];
    duration: number;
    classroomId: number | null;
    hourId: number;
    dayId: number;
  }[];
  groups: { id: number; name: string; classId: number; entireClass: boolean }[];
}

export const Days = [
  { short: "Pn", name: "Poniedziałek" },
  { short: "Wt", name: "Wtorek" },
  { short: "Śr", name: "Środa" },
  { short: "Czw", name: "Czwartek" },
  { short: "Pi", name: "Piątek" }
];

export async function fetchEdupageSchedule() {
  let timetableId = (
    await (
      await fetch("https://zs2ostrzeszow.edupage.org/timetable/server/ttviewer.js?__func=getTTViewerData", {
        method: "POST",
        body: JSON.stringify({ __args: [null, new Date().getFullYear() - 1], __gsh: "00000000" })
      })
    ).json()
  ).r.regular.default_num;

  let fetchedData = await fetch(
    "https://zs2ostrzeszow.edupage.org/timetable/server/regulartt.js?__func=regularttGetData",
    {
      method: "POST",
      body: JSON.stringify({ __args: [null, timetableId.toString()], __gsh: "00000000" })
    }
  );

  let fetchedJson = await fetchedData.json();

  if (fetchedJson.r.error) {
    throw new Error(fetchedJson.r.error);
  }

  let parsedData: ScheduleData = {
    hours: fetchedJson.r.dbiAccessorRes.tables[1].data_rows.map((data: { starttime: string; endtime: string }) => {
      return {
        startTime: data.starttime,
        endTime: data.endtime
      };
    }),
    buildings: fetchedJson.r.dbiAccessorRes.tables[10].data_rows.map((data: { name: string; short: string }) => {
      return {
        name: data.name,
        short: data.short
      };
    }),
    classrooms: fetchedJson.r.dbiAccessorRes.tables[11].data_rows.map(
      (data: { id: string; name: string; short: string; buildingid: string[] }) => {
        return {
          id: parseInt(data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)),
          name: data.name,
          short: data.short,
          buildingId: parseInt(data.buildingid[1]) - 1
        };
      }
    ),
    classes: fetchedJson.r.dbiAccessorRes.tables[12].data_rows.map(
      (data: { id: string; name: string; teacherid: string }) => {
        return {
          id: parseInt(data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)),
          name: data.name,
          teacherId: parseInt(data.teacherid)
        };
      }
    ),
    subjects: fetchedJson.r.dbiAccessorRes.tables[13].data_rows.map(
      (data: { id: string; name: string; short: string }) => {
        return {
          id: parseInt(data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)),
          name: data.name,
          short: data.short
        };
      }
    ),
    teachers: fetchedJson.r.dbiAccessorRes.tables[14].data_rows.map((data: { id: string; short: string }) => {
      return {
        id: parseInt(data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)),
        short: data.short
      };
    }),
    lessons: fetchedJson.r.dbiAccessorRes.tables[18].data_rows.flatMap(
      (data: {
        id: string;
        subjectid: string;
        teacherids: string[];
        groupids: string[];
        classids: string[];
        durationperiods: number;
      }) => {
        let result: {
          id: number;
          subjectId: number;
          teacherId: number;
          groupIds: any[];
          classIds: number[];
          duration: number;
          classroomId: number | null;
          hourId: number;
          dayId: number;
        }[] = [];

        let id = parseInt(data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length));

        let cards = fetchedJson.r.dbiAccessorRes.tables[20].data_rows.filter((cardsData: { lessonid: string }) => {
          let lessonId = cardsData.lessonid;
          return parseInt(lessonId.slice(lessonId.includes("*") ? 1 : 0, lessonId.length)) == id;
        });

        for (let i = 0; i < cards.length; i++) {
          let card = cards[i];
          let dayId = -1;
          switch (card.days) {
            case "10000":
              dayId = 0;
              break;
            case "01000":
              dayId = 1;
              break;
            case "00100":
              dayId = 2;
              break;
            case "00010":
              dayId = 3;
              break;
            case "00001":
              dayId = 4;
              break;
            default:
              return -1;
          }

          let hourId = parseInt(card.period) - 1;
          let classroomId: number | null = null;
          if (card.classroomids.length != 0) {
            let textClassroomId = card.classroomids[0];
            classroomId = parseInt(
              textClassroomId.slice(textClassroomId.includes("*") ? 1 : 0, textClassroomId.length)
            );
          }

          let cardId = parseInt(card.id.slice(card.id.includes("*") ? 1 : 0, card.id.length));

          result.push({
            id: cardId,
            subjectId: parseInt(data.subjectid.slice(data.subjectid.includes("*") ? 1 : 0, data.subjectid.length)),
            teacherId: data.teacherids.map((teacherId) => {
              return parseInt(teacherId.slice(teacherId.includes("*") ? 1 : 0, teacherId.length));
            })[0],
            groupIds: data.groupids.map((groupId) => {
              return parseInt(groupId.slice(groupId.includes("*") ? 1 : 0, groupId.length));
            }),
            classIds: data.classids.map((classId) => {
              return parseInt(classId.slice(classId.includes("*") ? 1 : 0, classId.length));
            }),
            duration: data.durationperiods,
            classroomId: classroomId || null,
            hourId: hourId,
            dayId: dayId
          });
        }

        return result;
      }
    ),
    groups: fetchedJson.r.dbiAccessorRes.tables[15].data_rows.map(
      (data: { id: string; name: string; classid: string; entireclass: boolean }) => {
        return {
          id: parseInt(data.id.slice(data.id.includes("*") ? 1 : 0, data.id.length)),
          name: data.name,
          classId: parseInt(data.classid.slice(data.classid.includes("*") ? 1 : 0, data.classid.length)),
          entireClass: data.entireclass
        };
      }
    )
  };

  parsedData.groups = parsedData.groups.filter((value: { id: number }) => {
    let usedGroups = [
      ...new Set(
        parsedData.lessons.flatMap((lesson) => {
          return lesson.groupIds;
        })
      )
    ];
    return usedGroups.includes(value.id);
  });

  return parsedData;
}

type Diff = {
  original: string;
  replacement: string | undefined;
};

type ChangeDiff = {
  subject: Diff | undefined;
  teacher: Diff | undefined;
  classroom: Diff | undefined;
};

export async function fetchSubstitutionData(day: Date, mode: "classes" | "teachers") {
  let fetchedData = await (
    await fetch("https://zs2ostrzeszow.edupage.org/substitution/server/viewer.js?__func=getSubstViewerDayDataHtml", {
      method: "POST",
      body: JSON.stringify({
        __args: [
          null,
          {
            date: day.toISOString().slice(0, 10),
            mode: mode
          }
        ],
        __gsh: "00000000"
      })
    })
  ).json();

  let htmlData = fetchedData.r;

  let doc = parse(htmlData);

  let data = doc
    .querySelector("[data-date]")
    .querySelectorAll(".section, .print-nobreak")
    .map((element) => {
      const isAbsent = element.querySelector(".absent") != null;

      return {
        className: element.querySelector(".header").firstChild.innerText,
        isAbsent: isAbsent,
        rows: !isAbsent
          ? element
              .querySelector(".rows")
              .querySelectorAll(".row")
              .map((row) => {
                const type: "change" | "cancel" = row.classList.contains("change") ? "change" : "cancel";

                let info = row.querySelector(".info").firstChild.innerText;
                const classroomChanged = info.includes(" Zmień salę lekcyjną: ");
                const subjectChanged = info.includes(" Zastępstwa: ");

                if (type === "cancel") {
                  info = info.replace(", Anulowano", "");
                }

                if (type === "change") {
                  if (info.includes(" Zastępstwa: ")) info = info.split(" Zastępstwa: ").join(" ");

                  if (info.includes(" Zmień salę lekcyjną: ")) info = info.split(" Zmień salę lekcyjną: ").join(" ");

                  if (info.includes("Nauczyciel: ")) info = info.split("Nauczyciel: ").join(" ");
                }

                let hours = info.split(",")[0];
                info = info.slice(hours.length + 2, info.length);

                let groups = info.includes(": ") ? info.split(":")[0].split(", ") : [];

                if (groups.length > 0) {
                  info = info.slice(groups.join(", ").length + 2, info.length);
                }

                let diff: ChangeDiff = { subject: undefined, teacher: undefined, classroom: undefined };

                if (type === "change") {
                  if (classroomChanged) {
                    let classroomChange = info.split(", ")[1];
                    info = info.substring(0, info.length - classroomChange.length - 2);

                    let classrooms = classroomChange.split(" ➔ ");

                    diff.classroom = {
                      original: classrooms[0].replace("(", "").replace(")", ""),
                      replacement: classrooms[1]
                    };
                  }

                  if (subjectChanged) {
                    let changes = info.split(", ")[0];
                    let additionalInfo = info.split(", ")[1];

                    if (additionalInfo !== undefined) {
                      info = additionalInfo;
                    } else {
                      info = "";
                    }

                    let subjects = changes.split(" - ")[0].split(" ➔ ");
                    changes = changes.slice(subjects.join(" ➔ ").length + 2, changes.length);

                    diff.subject = {
                      original: subjects[0].replace("(", "").replace(")", ""),
                      replacement: subjects[1]
                    };

                    let teachers = changes.split(" ➔ ");
                    diff.teacher = {
                      original: teachers[0].replace("(", "").replace(")", ""),
                      replacement: teachers[1]
                    };
                  } else {
                    let changes = info.split(", ")[0];
                    let additionalInfo = info.split(", ")[1];
                    if (additionalInfo !== undefined) {
                      info = additionalInfo;
                    } else {
                      info = "";
                    }

                    let subject = changes.split(" - ")[0];
                    let teacher = changes.split(" - ")[1];

                    diff.subject = {
                      original: subject,
                      replacement: undefined
                    };

                    diff.teacher = {
                      original: teacher.trim(),
                      replacement: undefined
                    };
                  }
                }

                if (type === "cancel") {
                  let subjectChange = info.split("-")[0];
                  info = info.slice(subjectChange.length + 2, info.length);

                  diff.subject = {
                    original: subjectChange.split(")")[0].trim(),
                    replacement: undefined
                  };

                  diff.teacher = {
                    original: info,
                    replacement: undefined
                  };

                  info = "";
                }

                return {
                  type: type,
                  groups: groups,
                  diff: diff,
                  period: row.querySelector(".period").firstChild.innerText.replace("(", "").replace(")", ""),
                  hours: hours,
                  info: info
                };
              })
          : undefined
      };
    });

  return data;
}
