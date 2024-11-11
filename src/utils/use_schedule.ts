import { useEffect, useMemo } from "react";
import { ScheduleData } from "./edupage";
import { Selection } from "../selection";

type LessonData = {
  hourId: number;
  name: string;
  classroom: string | null;
  teacher: string;
  group: string | null;
};

type LabelValue = { label: string; value: number };

export function useSchedule(
  data: ScheduleData | null,
  selection: Selection | null,
  dayId: number,
  selectedClass: number | null,
  selectedGroups: number[],
  setClass: (value: number) => void,
  setSelectedClass: (value: number) => void,
  setGroups: (value: number[]) => void
): [LabelValue[], LessonData[], LabelValue[]] {
  const classes = useMemo(() => {
    if (data == null) return [];

    return data.classes.map((classValue) => {
      return { label: classValue.name, value: classValue.id };
    });
  }, [data]);

  const classGroups = useMemo(() => {
    if (data == null || selectedClass == null) return [];

    return data.groups
      .filter((grupa) => grupa.classId === selectedClass && !grupa.entireClass)
      .map((grupa) => {
        return { label: grupa.name, value: grupa.id };
      });
  }, [data, selectedClass]);

  const lessons = useMemo(() => {
    if (data == null || selectedClass == null) return [];

    const groupId = data.groups.find((grupa) => grupa.classId === selectedClass && grupa.entireClass).id;

    return data.lessons
      .filter((lesson) => {
        return lesson.groupIds.some((id) => [...selectedGroups, groupId].includes(id)) && lesson.dayId === dayId;
      })
      .sort((a, b) => {
        return a.hourId - b.hourId;
      })
      .flatMap((obj) => {
        let lessonData: LessonData[] = [];
        const hourId = obj.hourId;
        for (let i = 0; i < obj.duration; i++) {
          lessonData[i] = {
            hourId: hourId + i,
            name: data.subjects.find((subject) => subject.id === obj.subjectId).name,
            classroom: data.classrooms.find((classroom) => classroom.id === obj.classroomId)?.short,
            teacher: data.teachers.find((teacher) => teacher.id === obj.teacherId).short,
            group: data.groups.find((group) => obj.groupIds.includes(group.id) && !group.entireClass)?.name
          };
        }
        return lessonData;
      });
  }, [data, selectedClass, selectedGroups, dayId]);

  useEffect(() => {
    if (data == null || selection == null) return;

    let foundClass = classes.find((value) => value.label === selection.className);
    if (foundClass === undefined) {
      setClass(null);
      return;
    }

    setSelectedClass(foundClass.value);
  }, [data, selection, classes]);

  useEffect(() => {
    if (data == null || selection == null || selectedClass == null || classGroups.length === 0) return;

    setGroups(classGroups.filter((value) => selection.classGroups.includes(value.label)).map((value) => value.value));
  }, [data, selection, selectedClass, classGroups]);

  return [classes, lessons, classGroups];
}
