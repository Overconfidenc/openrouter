function formatEmployee(employees) {
  if (!employees || employees.length === 0) return "—";
  const emp = employees[0];
  const parts = [emp.lastName];
  if (emp.firstName) parts.push(`${emp.firstName.charAt(0)}.`);
  if (emp.middleName) parts.push(`${emp.middleName.charAt(0)}.`);
  return parts.join(' ');
}

function formatWeeks(weekNumbers) {
  if (!weekNumbers || weekNumbers.length === 0) return "—";
  if (weekNumbers.length === 4) return "Все недели";
  if (weekNumbers.length === 1) return `Неделя ${weekNumbers[0]}`;
  return `Недели ${weekNumbers.join(', ')}`;
}

function formatSubgroup(numSubgroup) {
  if (numSubgroup === 0) return "";
  return `(п/г ${numSubgroup})`;
}

function formatAuditories(auditories) {
  if (!auditories || auditories.length === 0) return "—";
  return auditories.join(', ');
}

export function transformSchedule(fullSchedule) {
  const groupDto = fullSchedule.studentGroupDto;
  const groupInfo = {
    group: groupDto.name,
    faculty: `${groupDto.facultyAbbrev} (${groupDto.facultyName})`,
    speciality: groupDto.specialityName,
    course: groupDto.course,
    semester: `${fullSchedule.currentTerm} (${fullSchedule.startDate} - ${fullSchedule.endDate})`,
    exams: `${fullSchedule.startExamsDate} - ${fullSchedule.endExamsDate}`
  };

  const regularSchedule = {};
  const oneTimeEvents = [];

  
  for (const dayName in fullSchedule.schedules) {
    regularSchedule[dayName] = [];
    for (const lesson of fullSchedule.schedules[dayName]) {
      const simplifiedLesson = {
        time: `${lesson.startLessonTime} - ${lesson.endLessonTime}`,
        subject: lesson.subject || "Событие",
        subjectFull: lesson.subjectFullName || lesson.note || "Нет данных",
        type: lesson.lessonTypeAbbrev || "---",
        teacher: formatEmployee(lesson.employees),
        location: formatAuditories(lesson.auditories),
      };

      if (lesson.announcement || lesson.dateLesson) {
        simplifiedLesson.date = lesson.dateLesson;
        simplifiedLesson.note = lesson.note;
        oneTimeEvents.push(simplifiedLesson);
      } else {
        simplifiedLesson.weeks = formatWeeks(lesson.weekNumber);
        simplifiedLesson.subgroup = formatSubgroup(lesson.numSubgroup);
        regularSchedule[dayName].push(simplifiedLesson);
      }
    }
  }
  
  
  for (const examEvent of fullSchedule.exams) {
     const simplifiedEvent = {
        date: examEvent.dateLesson,
        time: `${examEvent.startLessonTime} - ${examEvent.endLessonTime}`,
        subject: examEvent.subject || "Событие сессии",
        subjectFull: examEvent.subjectFullName || examEvent.note,
        type: examEvent.lessonTypeAbbrev || "Консультация",
        teacher: formatEmployee(examEvent.employees),
        location: formatAuditories(examEvent.auditories),
        note: examEvent.note,
     };
     oneTimeEvents.push(simplifiedEvent);
  }

  return {
    groupInfo,
    regularSchedule,
    oneTimeEvents
  };
}
