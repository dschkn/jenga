"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { siblingAppUrl } from "../../../packages/platform/links.mjs";
import scheduleData from "./schedule-data.json";

function CrmLink() {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { setUrl(siblingAppUrl('crm', window.location, process.env.NEXT_PUBLIC_CRM_URL)); }, []);
  return url ? <a className="suite-link" href={url}>Открыть Jenga CRM ↗</a> : null;
}

type Tab = "today" | "calendar" | "stats" | "profile";
type AttendanceStatus = "present" | "absent" | null;
type LessonAction = "cancel" | "reschedule";

type Student = {
  id: number;
  name: string;
  attendance: AttendanceStatus;
};

type Lesson = {
  id: number;
  date: string;
  day: number;
  dateLabel: string;
  time: string;
  duration: string;
  language: "Немецкий" | "Английский";
  kind: "Группа" | "Индивидуально" | "Проб+конс" | "Тестирование";
  title: string;
  level: string;
  room: string;
  category: "trial" | "group" | "individual";
  note?: string | null;
  teacherComment?: string | null;
  homework?: string;
  cancelled?: boolean;
  cancellationReason?: string | null;
  rescheduleRequest?: string;
  students: Student[];
};

type TeacherProfile = {
  firstName: string;
  lastName: string;
  role: string;
  education: string;
  bio: string;
};

const DEMO_LOGIN = "marina";
const DEMO_PASSWORD = "jenga2026";

const initialLessons = scheduleData as Lesson[];
const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
const monthNamesGenitive = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const monthNamesPrepositional = ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"];
const dayNames = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const currentDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

type UiIconName = "arrow-up-right" | "calendar" | "check" | "clock" | "close" | "logout" | "mail" | "map-pin" | "plus" | "user" | "bell";

function UiIcon({ name, className = "" }: { name: UiIconName; className?: string }) {
  const paths: Record<UiIconName, React.ReactNode> = {
    "arrow-up-right": <><path d="M7 17 17 7" /><path d="M9 7h8v8" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    close: <path d="m7 7 10 10M17 7 7 17" />,
    logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
    "map-pin": <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  };
  return <svg className={`ui-icon ${className}`} viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

function lessonIsMarked(lesson: Lesson) {
  return Boolean(lesson.cancelled) || lesson.students.every((student) => student.attendance !== null);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [lessons, setLessons] = useState(initialLessons);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [calendarDate, setCalendarDate] = useState(currentDate);
  const [calendarMonth, setCalendarMonth] = useState(new Date(`${currentDate}T12:00:00`).getMonth());
  const [calendarMode, setCalendarMode] = useState<"month" | "year">("month");
  const [statsMonth, setStatsMonth] = useState(Math.min(6, Math.max(2, new Date(`${currentDate}T12:00:00`).getMonth())));
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [shiftClosed, setShiftClosed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [lessonAction, setLessonAction] = useState<{ lessonId: number; type: LessonAction } | null>(null);
  const [actionComment, setActionComment] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("2026-07-15");
  const [rescheduleTime, setRescheduleTime] = useState("18:00");
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile>({
    firstName: "Марина",
    lastName: "Волкова",
    role: "Преподаватель немецкого языка",
    education: "Высшее педагогическое образование",
    bio: "Преподаю немецкий язык взрослым и подросткам. Люблю живую речь, ясную грамматику и занятия без школьной пыли.",
  });

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      }).catch(() => undefined);
    }
    if ("caches" in window) {
      window.caches.keys().then((keys) => {
        keys.forEach((key) => window.caches.delete(key));
      }).catch(() => undefined);
    }
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      document.documentElement.classList.add("touch-device");
    }
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
    queueMicrotask(() => setInstalled(standalone));
  }, []);

  const todayLessons = lessons.filter((lesson) => lesson.date === currentDate);
  const completedToday = todayLessons.filter(lessonIsMarked).length;
  const remainingToday = todayLessons.length - completedToday;
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? null;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  };

  const updateAttendance = (lessonId: number, studentId: number, status: Exclude<AttendanceStatus, null>) => {
    if (shiftClosed) return;
    setLessons((current) =>
      current.map((lesson) =>
        lesson.id === lessonId
          ? {
              ...lesson,
              students: lesson.students.map((student) =>
                student.id === studentId ? { ...student, attendance: status } : student,
              ),
            }
          : lesson,
      ),
    );
  };

  const updateLessonText = (lessonId: number, field: "teacherComment" | "homework", value: string) => {
    setLessons((current) => current.map((lesson) => lesson.id === lessonId ? { ...lesson, [field]: value } : lesson));
  };

  const openLessonAction = (lessonId: number, type: LessonAction) => {
    setLessonAction({ lessonId, type });
    setActionComment("");
  };

  const submitLessonAction = () => {
    if (!lessonAction) return;
    if (!actionComment.trim()) {
      showToast("Добавьте короткий комментарий");
      return;
    }
    setLessons((current) => current.map((lesson) => {
      if (lesson.id !== lessonAction.lessonId) return lesson;
      if (lessonAction.type === "cancel") {
        return { ...lesson, cancelled: true, cancellationReason: actionComment.trim() };
      }
      return { ...lesson, rescheduleRequest: `${rescheduleDate.split("-").reverse().join(".")} · ${rescheduleTime} · ${actionComment.trim()}` };
    }));
    setLessonAction(null);
    setSelectedLessonId(null);
    showToast(lessonAction.type === "cancel" ? "Отмена сохранена" : "Запрос на перенос сохранён");
  };

  const saveLesson = () => {
    if (!selectedLesson || !lessonIsMarked(selectedLesson)) {
      showToast("Отметьте всех учеников");
      return;
    }
    setSelectedLessonId(null);
    showToast("Посещаемость сохранена");
  };

  const openCloseDialog = () => {
    if (remainingToday > 0) {
      showToast(`Осталось заполнить занятий: ${remainingToday}`);
      return;
    }
    setShowCloseDialog(true);
  };

  const closeShift = () => {
    setShiftClosed(true);
    setShowCloseDialog(false);
    const report = todayLessons.map((lesson) => `${lesson.time} ${lesson.title}: ${lesson.students.map((student) => `${student.name} — ${student.attendance === "present" ? "был(а)" : "не был(а)"}`).join(", ")}`).join("\n");
    window.location.href = `mailto:?subject=${encodeURIComponent(`Закрытие смены · ${currentDate}`)}&body=${encodeURIComponent(`Преподаватель: ${profile.firstName} ${profile.lastName}\nДата: ${currentDate}\n\n${report}`)}`;
    showToast("Смена закрыта. Отчёт подготовлен для отправки");
  };

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return (
    <main className="app-shell">
      <aside className="side-panel" aria-label="Основная навигация">
        <div className="brand">
          <div className="brand-mark official-mark" aria-hidden="true" />
          <div>
            <strong>Jenga</strong>
            <span>Teacher</span>
          </div>
        </div>

        <nav className="desktop-nav">
          <CrmLink />
          <NavButton tab="today" activeTab={activeTab} label="Сегодня" icon="home" onClick={setActiveTab} />
          <NavButton tab="calendar" activeTab={activeTab} label="Календарь" icon="calendar" onClick={setActiveTab} />
          <NavButton tab="stats" activeTab={activeTab} label="Статистика" icon="stats" onClick={setActiveTab} />
          <NavButton tab="profile" activeTab={activeTab} label="Профиль" icon="profile" onClick={setActiveTab} />
        </nav>

        <button className="teacher-card" onClick={() => setActiveTab("profile")}>
          <Avatar className="avatar" />
          <div>
            <strong>{profile.firstName} {profile.lastName}</strong>
            <span>Преподаватель</span>
          </div>
          <span className="teacher-menu" aria-hidden="true">···</span>
        </button>
      </aside>

      <section className="workspace">
        <header className="mobile-header">
          <div className="brand-mark official-mark" aria-hidden="true" />
          <div className="mobile-brand-copy">
            <strong>Jenga</strong>
            <span>Teacher</span>
          </div>
          <button className="avatar-button" onClick={() => setActiveTab("profile")} aria-label={`Открыть профиль ${profile.firstName}`}>
            <Avatar className="avatar small" />
          </button>
        </header>

        {activeTab === "today" && (
          <TodayView
            date={currentDate}
            lessons={todayLessons}
            teacherFirstName={profile.firstName}
            completedLessons={completedToday}
            remainingLessons={remainingToday}
            shiftClosed={shiftClosed}
            onLessonClick={setSelectedLessonId}
            onCloseShift={openCloseDialog}
          />
        )}

        {activeTab === "calendar" && (
          <CalendarView
            mode={calendarMode}
            onModeChange={setCalendarMode}
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
            selectedDate={calendarDate}
            onDateChange={setCalendarDate}
            lessons={lessons}
            onLessonClick={setSelectedLessonId}
          />
        )}

        {activeTab === "stats" && (
          <StatsView lessons={lessons} month={statsMonth} teacherName={`${profile.firstName} ${profile.lastName}`} onMonthChange={setStatsMonth} />
        )}

        {activeTab === "profile" && (
          <ProfileView
            installed={installed}
            profile={profile}
            onInstall={() => setShowInstallHelp(true)}
            onEdit={() => setShowProfileEdit(true)}
            onLogout={() => setAuthenticated(false)}
          />
        )}
      </section>

      <nav className="bottom-nav" aria-label="Мобильная навигация">
        <NavButton tab="today" activeTab={activeTab} label="Сегодня" icon="home" onClick={setActiveTab} />
        <NavButton tab="calendar" activeTab={activeTab} label="Календарь" icon="calendar" onClick={setActiveTab} />
        <NavButton tab="stats" activeTab={activeTab} label="Статистика" icon="stats" onClick={setActiveTab} />
        <NavButton tab="profile" activeTab={activeTab} label="Профиль" icon="profile" onClick={setActiveTab} />
      </nav>

      {selectedLesson && (
        <LessonSheet
          lesson={selectedLesson}
          locked={shiftClosed}
          onClose={() => setSelectedLessonId(null)}
          onAttendance={updateAttendance}
          onSave={saveLesson}
          onTextChange={updateLessonText}
          onAction={openLessonAction}
        />
      )}

      {lessonAction && (
        <LessonActionDialog
          type={lessonAction.type}
          comment={actionComment}
          date={rescheduleDate}
          time={rescheduleTime}
          onCommentChange={setActionComment}
          onDateChange={setRescheduleDate}
          onTimeChange={setRescheduleTime}
          onClose={() => setLessonAction(null)}
          onSubmit={submitLessonAction}
        />
      )}

      {showProfileEdit && (
        <ProfileEditDialog
          profile={profile}
          onClose={() => setShowProfileEdit(false)}
          onSave={(nextProfile) => {
            setProfile(nextProfile);
            setShowProfileEdit(false);
            showToast("Профиль обновлён");
          }}
        />
      )}

      {showCloseDialog && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowCloseDialog(false)}>
          <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="close-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dialog-icon"><UiIcon name="check" /></div>
            <h2 id="close-title">Закрыть смену?</h2>
            <p>Посещаемость заполнена для всех занятий сегодня. После закрытия будет подготовлено письмо администратору.</p>
            <div className="dialog-actions">
              <button className="button secondary" onClick={() => setShowCloseDialog(false)}>Отмена</button>
              <button className="button primary" onClick={closeShift}>Закрыть смену</button>
            </div>
          </section>
        </div>
      )}

      {showInstallHelp && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowInstallHelp(false)}>
          <section className="install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="icon-button install-close" onClick={() => setShowInstallHelp(false)} aria-label="Закрыть"><UiIcon name="close" /></button>
            <div className="app-icon-preview official-mark" aria-hidden="true" />
            <p className="eyebrow">Установка на iPhone</p>
            <h2 id="install-title">Добавьте приложение на экран «Домой»</h2>
            <ol>
              <li><span>1</span><div><strong>Откройте эту страницу в Safari</strong><p>Установка надёжнее всего работает через стандартный браузер iPhone.</p></div></li>
              <li><span>2</span><div><strong>Нажмите кнопку «Поделиться»</strong><p>Квадрат со стрелкой вверх находится в нижней панели Safari.</p></div></li>
              <li><span>3</span><div><strong>Выберите «На экран Домой»</strong><p>Затем нажмите «Добавить» в правом верхнем углу.</p></div></li>
            </ol>
            <div className="install-result"><UiIcon name="check" /><p>После этого появится иконка Jenga, а приложение будет открываться без браузерной панели.</p></div>
            <button className="button primary wide" onClick={() => setShowInstallHelp(false)}>Понятно</button>
          </section>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

function NavButton({ tab, activeTab, label, icon, onClick }: { tab: Tab; activeTab: Tab; label: string; icon: "home" | "calendar" | "stats" | "profile"; onClick: (tab: Tab) => void }) {
  return (
    <button className={activeTab === tab ? "nav-button active" : "nav-button"} onClick={() => onClick(tab)}>
      <span className="nav-glyph" aria-hidden="true"><NavIcon name={icon} /></span>
      <span>{label}</span>
    </button>
  );
}

function Avatar({ className }: { className: string }) {
  return <span className={className}><span aria-hidden="true">МВ</span></span>;
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (login.trim().toLowerCase() === DEMO_LOGIN && password.trim() === DEMO_PASSWORD) {
      setError("");
      onLogin();
      return;
    }
    setError("Не получилось войти. Проверьте логин и пароль.");
  };

  return (
    <main className="login-screen">
      <section className="login-layout">
        <div className="login-brand">
          <img src="/jenga-icon.png" alt="" /><strong className="jenga-wordmark">Jenga</strong>
          <p>Кабинет преподавателя</p>
          <h1>Расписание всегда под рукой.</h1>
          <span>Занятия, посещаемость и рабочий день — в одном спокойном месте.</span>
        </div>
        <form className="login-card" onSubmit={submit}>
          <div className="login-card-heading">
            <span className="login-kicker">Jenga</span>
            <h2>Вход в аккаунт</h2>
            <p>Введите данные, выданные администратором школы.</p>
          </div>
          <div className="login-field">
            <label htmlFor="teacher-login">Логин</label>
            <input id="teacher-login" value={login} onChange={(event) => setLogin(event.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} inputMode="text" placeholder="Ваш логин" />
          </div>
          <div className="login-field">
            <label htmlFor="teacher-password">Пароль</label>
            <span className="password-field">
              <input id="teacher-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" autoCapitalize="none" spellCheck={false} placeholder="Ваш пароль" />
              <button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? "Скрыть" : "Показать"}</button>
            </span>
          </div>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit">Войти <span>→</span></button>
          <CrmLink />
          <p className="demo-credentials"><strong>Демо-доступ</strong><span>Логин: marina</span><span>Пароль: jenga2026</span></p>
        </form>
      </section>
    </main>
  );
}

function NavIcon({ name }: { name: "home" | "calendar" | "stats" | "profile" }) {
  if (name === "home") {
    return <svg viewBox="0 0 24 24" fill="none"><path d="M3.5 10.8 12 3.7l8.5 7.1v9.1H15v-5.7H9v5.7H3.5v-9.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>;
  }
  if (name === "calendar") {
    return <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5.3" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.8" /><path d="M7.5 3v4.2M16.5 3v4.2M3.5 9.3h17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" /></svg>;
  }
  if (name === "stats") {
    return <svg viewBox="0 0 24 24" fill="none"><path d="M4 20V9.5M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" /><path d="M4.5 20c.7-4 3.2-6 7.5-6s6.8 2 7.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

function TodayView({ date, lessons, teacherFirstName, completedLessons, remainingLessons, shiftClosed, onLessonClick, onCloseShift }: {
  date: string;
  lessons: Lesson[];
  teacherFirstName: string;
  completedLessons: number;
  remainingLessons: number;
  shiftClosed: boolean;
  onLessonClick: (id: number) => void;
  onCloseShift: () => void;
}) {
  const dateObject = new Date(`${date}T12:00:00`);
  const dateHeading = `${dayNames[dateObject.getDay()]}, ${dateObject.getDate()} ${monthNamesGenitive[dateObject.getMonth()]}`;
  const firstLessonTime = lessons[0]?.time;
  const totalHours = lessons.reduce((sum, lesson) => {
    const [start, end] = lesson.duration.split("–").map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours + minutes / 60;
    });
    return sum + Math.max(end - start, 0);
  }, 0);
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">{dateHeading}</p>
          <h1>Добрый день, {teacherFirstName}</h1>
          <p className="subtitle">{lessons.length ? `Сегодня у вас ${lessons.length} ${lessons.length === 1 ? "занятие" : "занятия"} · первое в ${firstLessonTime}` : "Сегодня занятий нет"}</p>
        </div>
        <div className="demo-pill"><span /> Демо-режим</div>
      </div>

      {lessons.length > 0 && <section className="progress-card">
        <div className="progress-copy">
          <div className="progress-ring" style={{ "--progress": `${Math.round((completedLessons / lessons.length) * 100)}%` } as React.CSSProperties}>
            <span>{completedLessons}/{lessons.length}</span>
          </div>
          <div>
            <h2>{shiftClosed ? "Смена закрыта" : completedLessons === lessons.length ? "Всё готово" : "Посещаемость за день"}</h2>
            <p>{shiftClosed ? "Данные переданы администратору" : remainingLessons ? `Нужно заполнить ещё ${remainingLessons} занятия` : "Можно закрывать смену"}</p>
          </div>
        </div>
        <button className="button close-shift" onClick={onCloseShift} disabled={shiftClosed}>
          {shiftClosed && <UiIcon name="check" />}
          {shiftClosed ? "Смена закрыта" : "Закрыть смену"}
        </button>
      </section>}

      <div className="section-title">
        <div>
          <h2>Расписание</h2>
          <span>{lessons.length ? `${lessons.length} ${lessons.length === 1 ? "занятие" : "занятия"} · ${totalHours.toLocaleString("ru-RU")} ч` : "Занятий нет"}</span>
        </div>
        <button className="text-button">Весь день</button>
      </div>

      <div className="timeline">
        {lessons.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} onClick={() => onLessonClick(lesson.id)} />
        ))}
      </div>
    </div>
  );
}

function LessonCard({ lesson, onClick, compact = false }: { lesson: Lesson; onClick: () => void; compact?: boolean }) {
  const marked = lessonIsMarked(lesson);
  const present = lesson.students.filter((student) => student.attendance === "present").length;
  const absent = lesson.students.filter((student) => student.attendance === "absent").length;
  const singleAbsent = lesson.students.length === 1 && absent === 1;
  const singlePresent = lesson.students.length === 1 && present === 1;
  const statusClass = lesson.cancelled || singleAbsent ? "status-badge absent" : lesson.rescheduleRequest ? "status-badge move" : marked ? "status-badge done" : "status-badge";
  return (
    <article className={`lesson-row ${compact ? "compact" : ""}`}>
      {!compact && <div className={`time-column time-${lesson.category}`}><strong>{lesson.time}</strong><span>{lesson.duration.split("–")[1]}</span></div>}
      <button className={`lesson-card type-${lesson.category}`} onClick={onClick}>
        <span className="lesson-accent" />
        <div className="lesson-main">
          <div className="lesson-tags">
            <span>{lesson.language}</span>
            <span>{lesson.kind}</span>
          </div>
          <h3>{lesson.title} <em>{lesson.level}</em></h3>
          <p><UiIcon name="map-pin" /> {lesson.room} <i /> <UiIcon name="user" /> {lesson.students.length} {lesson.students.length === 1 ? "ученик" : "учеников"}</p>
          {lesson.rescheduleRequest && <small className="request-note"><UiIcon name="arrow-up-right" /> Перенос: {lesson.rescheduleRequest.split(" · ").slice(0, 2).join(" · ")}</small>}
          {lesson.cancelled && <small className="request-note cancelled-note">Причина: {lesson.cancellationReason || "занятие отменено в расписании"}</small>}
        </div>
        <div className={statusClass}>
          <span>{lesson.cancelled || singleAbsent ? <UiIcon name="close" /> : marked ? <UiIcon name="check" /> : lesson.rescheduleRequest ? <UiIcon name="arrow-up-right" /> : "!"}</span>
          {lesson.cancelled ? "Отменено" : singleAbsent ? "Не был(а)" : lesson.rescheduleRequest ? "Перенос" : singlePresent ? "Был(а)" : marked ? `Отмечено · ${present}` : "Не отмечено"}
        </div>
        <span className="card-arrow">›</span>
      </button>
    </article>
  );
}

function LessonSheet({ lesson, locked, onClose, onAttendance, onSave, onTextChange, onAction }: {
  lesson: Lesson;
  locked: boolean;
  onClose: () => void;
  onAttendance: (lessonId: number, studentId: number, status: "present" | "absent") => void;
  onSave: () => void;
  onTextChange: (lessonId: number, field: "teacherComment" | "homework", value: string) => void;
  onAction: (lessonId: number, type: LessonAction) => void;
}) {
  const marked = lesson.students.filter((student) => student.attendance !== null).length;
  const [openNote, setOpenNote] = useState<"teacherComment" | "homework" | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const attendanceLocked = locked || Boolean(lesson.cancelled);
  return (
    <div className="modal-backdrop sheet-backdrop" onMouseDown={onClose}>
      <section className="lesson-sheet" role="dialog" aria-modal="true" aria-labelledby="lesson-title" onMouseDown={(event) => event.stopPropagation()} onTouchStart={(event) => { const target = event.target as HTMLElement; setDragStart(target.closest(".sheet-handle, .sheet-header") ? (event.touches[0]?.clientY ?? null) : null); }} onTouchEnd={(event) => { if (dragStart !== null && (event.changedTouches[0]?.clientY ?? dragStart) - dragStart > 80) onClose(); setDragStart(null); }}>
        <button className="sheet-handle" onClick={onClose} aria-label="Свернуть окно" />
        <header className="sheet-header">
          <div>
            <p className={`lesson-sheet-meta meta-${lesson.category}`}><strong>{lesson.duration}</strong><span> · {lesson.dateLabel}</span></p>
            <h2 id="lesson-title">{lesson.title} <span>{lesson.level}</span></h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Закрыть"><UiIcon name="close" /></button>
        </header>

        <div className={`lesson-summary summary-${lesson.category}`}>
          <div><span>Язык</span><strong>{lesson.language}</strong></div>
          <div><span>Формат</span><strong>{lesson.kind}</strong></div>
          <div><span>Аудитория</span><strong>{lesson.room.replace("Аудитория ", "№ ")}</strong></div>
        </div>

        <div className="lesson-tools">
          <button onClick={() => setOpenNote(openNote === "teacherComment" ? null : "teacherComment")}><UiIcon name="plus" /> Комментарий к занятию</button>
          <button onClick={() => setOpenNote(openNote === "homework" ? null : "homework")}><UiIcon name="plus" /> Домашнее задание</button>
        </div>
        {openNote && (
          <div className="lesson-note-editor">
            <label htmlFor={`lesson-${lesson.id}-${openNote}`}>{openNote === "teacherComment" ? "Комментарий преподавателя" : "Домашнее задание"}</label>
            <textarea
              id={`lesson-${lesson.id}-${openNote}`}
              value={lesson[openNote] ?? ""}
              onChange={(event) => onTextChange(lesson.id, openNote, event.target.value)}
              placeholder={openNote === "teacherComment" ? "Например: повторили спряжение глаголов…" : "Например: учебник, стр. 42, задания 3–5"}
            />
          </div>
        )}

        <div className="lesson-actions">
          <button className="move-action" onClick={() => onAction(lesson.id, "reschedule")} disabled={locked || lesson.cancelled}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg><span>Перенести</span></button>
          <button className="cancel-action" onClick={() => onAction(lesson.id, "cancel")} disabled={locked || lesson.cancelled}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg><span>Отменить</span></button>
        </div>

        <div className="attendance-heading">
          <div>
            <h3>Посещаемость</h3>
            <p>Отмечено {marked} из {lesson.students.length}</p>
          </div>
          {locked && <span className="locked-pill">Закрыто</span>}
        </div>

        <div className="student-list">
          {lesson.students.map((student) => (
            <div className="student-row" key={student.id}>
              <div className="student-name">
                <span className="mini-avatar">{getInitials(student.name)}</span>
                <strong>{student.name}</strong>
              </div>
              <div className="attendance-toggle">
                <button
                  className={student.attendance === "present" ? "present selected" : "present"}
                  onClick={() => onAttendance(lesson.id, student.id, "present")}
                  disabled={attendanceLocked}
                >
                  <UiIcon name="check" /> Был(а)
                </button>
                <button
                  className={student.attendance === "absent" ? "absent selected" : "absent"}
                  onClick={() => onAttendance(lesson.id, student.id, "absent")}
                  disabled={attendanceLocked}
                >
                  <UiIcon name="close" /> Не был(а)
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="sheet-footer">
          <div className="mark-progress"><span style={{ width: `${(marked / lesson.students.length) * 100}%` }} /></div>
          <button className="button primary wide" onClick={attendanceLocked ? onClose : onSave}>
            {lesson.cancelled ? "Закрыть" : locked ? "Закрыть" : "Сохранить посещаемость"}
          </button>
        </div>
      </section>
    </div>
  );
}

function CalendarView({ mode, onModeChange, month, onMonthChange, selectedDate, onDateChange, lessons, onLessonClick }: {
  mode: "month" | "year";
  onModeChange: (mode: "month" | "year") => void;
  month: number;
  onMonthChange: (month: number) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  lessons: Lesson[];
  onLessonClick: (id: number) => void;
}) {
  const year = 2026;
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const selectedLessons = lessons.filter((lesson) => lesson.date === selectedDate);
  const selectedDateObject = new Date(`${selectedDate}T12:00:00`);
  const lessonDates = new Set(lessons.filter((lesson) => lesson.date.startsWith(monthPrefix)).map((lesson) => lesson.date));
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const calendarCellCount = Math.max(35, Math.ceil((firstWeekday + daysInMonth) / 7) * 7);
  const calendarCells = Array.from({ length: calendarCellCount }, (_, index) => {
    const relativeDay = index - firstWeekday + 1;
    if (relativeDay < 1) return { day: daysInPreviousMonth + relativeDay, current: false };
    if (relativeDay > daysInMonth) return { day: relativeDay - daysInMonth, current: false };
    return { day: relativeDay, current: true };
  });
  const selectedHours = selectedLessons.reduce((sum, lesson) => {
    const [start, end] = lesson.duration.split("–").map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours + minutes / 60;
    });
    return sum + (end - start);
  }, 0);
  const changeMonth = (nextMonth: number) => {
    if (nextMonth < 0 || nextMonth > 11) return;
    onMonthChange(nextMonth);
    const prefix = `${year}-${String(nextMonth + 1).padStart(2, "0")}`;
    const firstLesson = lessons.find((lesson) => lesson.date.startsWith(prefix));
    onDateChange(firstLesson?.date ?? `${prefix}-01`);
  };
  return (
    <div className="page-content calendar-page">
      <div className="page-heading calendar-heading">
        <div><p className="eyebrow">Ваше расписание</p><h1>Календарь</h1></div>
        <div className="segmented"><button className={mode === "month" ? "active" : ""} onClick={() => onModeChange("month")}>Месяц</button><button className={mode === "year" ? "active" : ""} onClick={() => onModeChange("year")}>Год</button></div>
      </div>

      {mode === "month" ? (
        <section className="calendar-card">
          <div className="calendar-toolbar"><button aria-label="Предыдущий месяц" onClick={() => changeMonth(month - 1)} disabled={month === 0}>‹</button><h2>{monthNames[month]} <span>{year}</span></h2><button aria-label="Следующий месяц" onClick={() => changeMonth(month + 1)} disabled={month === 11}>›</button></div>
          <div className="calendar-grid weekdays">{weekDays.map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid days">
            {calendarCells.map((cell, index) => {
              const date = `${monthPrefix}-${String(cell.day).padStart(2, "0")}`;
              return <button key={`${date}-${index}`} className={`${cell.current && selectedDate === date ? "selected" : ""} ${!cell.current ? "outside" : ""}`} onClick={() => cell.current && onDateChange(date)} disabled={!cell.current}>{cell.day}{cell.current && lessonDates.has(date) && <span className="day-dot" />}</button>;
            })}
          </div>
        </section>
      ) : (
        <section className="year-grid">
          {monthNames.map((monthName, index) => {
            const count = lessons.filter((lesson) => lesson.date.startsWith(`${year}-${String(index + 1).padStart(2, "0")}`)).length;
            return <button key={monthName} className={index === month ? "current" : ""} onClick={() => { onModeChange("month"); changeMonth(index); }}>
              <span>{monthName}</span><strong>{count ? `${count} занятий` : "Нет данных"}</strong>
            </button>
          })}
        </section>
      )}

      <div className="schedule-legend" aria-label="Цвета типов занятий">
        <span><i className="legend-dot trial" /> Проб+конс</span>
        <span><i className="legend-dot group" /> Очная группа</span>
        <span><i className="legend-dot individual" /> Индивидуальное</span>
      </div>

      <div className="section-title selected-date"><div><h2>{selectedDateObject.getDate()} {monthNamesGenitive[selectedDateObject.getMonth()]}, {dayNames[selectedDateObject.getDay()]}</h2><span>{selectedLessons.length ? `${selectedLessons.length} ${selectedLessons.length === 1 ? "занятие" : "занятия"} · ${selectedHours.toLocaleString("ru-RU")} ч` : "Занятий нет"}</span></div></div>
      {selectedLessons.length ? (
        <div className="calendar-lessons">{selectedLessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} onClick={() => onLessonClick(lesson.id)} compact />)}</div>
      ) : (
        <div className="empty-state"><span>○</span><h3>Свободный день</h3><p>На эту дату занятий нет</p></div>
      )}
    </div>
  );
}

type MetricKey = "offline" | "online" | "individual" | "trial" | "club" | "attendance";

function StatsView({ lessons, month, teacherName, onMonthChange }: { lessons: Lesson[]; month: number; teacherName: string; onMonthChange: (month: number) => void }) {
  const [expandedMetric, setExpandedMetric] = useState<MetricKey | null>(null);
  const [metricClosing, setMetricClosing] = useState(false);
  const periodLessons = lessons.filter((lesson) => lesson.date.startsWith(`2026-${String(month + 1).padStart(2, "0")}`));
  const conducted = periodLessons.filter((lesson) => !lesson.cancelled);
  const offlineGroups = conducted.filter((lesson) => lesson.category === "group" && !/\bОН\b|онлайн/i.test(lesson.note ?? ""));
  const onlineGroups = conducted.filter((lesson) => lesson.category === "group" && /\bОН\b|онлайн/i.test(lesson.note ?? ""));
  const individualLessons = conducted.filter((lesson) => lesson.category === "individual");
  const trialLessons = conducted.filter((lesson) => lesson.category === "trial");
  const clubs = conducted.filter((lesson) => /разговорн/i.test(`${lesson.title} ${lesson.note ?? ""}`));
  const onlineClubs = clubs.filter((lesson) => /онлайн|zoom|ОН/i.test(`${lesson.room} ${lesson.note ?? ""}`));
  const offlineClubs = clubs.filter((lesson) => !onlineClubs.includes(lesson));
  const attendanceRates: Record<number, number> = { 2: 83, 3: 79, 4: 82, 5: 78, 6: 80 };
  const attendanceRate = attendanceRates[month] ?? 80;
  const totalStudentVisits = conducted.reduce((sum, lesson) => sum + lesson.students.length, 0);
  const present = Math.round(totalStudentVisits * attendanceRate / 100);
  const absent = Math.max(totalStudentVisits - present, 0);
  const cancelled = periodLessons.filter((lesson) => lesson.cancelled).length;
  const workingDays = new Set(conducted.map((lesson) => lesson.date)).size;
  const lessonHours = conducted.reduce((sum, lesson) => {
    const [start, end] = lesson.duration.split("–").map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours + minutes / 60;
    });
    return sum + Math.max(end - start, 0);
  }, 0);
  const totalFormats = Math.max(conducted.length, 1);
  const individualByStudent = individualLessons.reduce<Record<string, number>>((result, lesson) => {
    result[lesson.title] = (result[lesson.title] ?? 0) + 1;
    return result;
  }, {});
  const groupByCourse = offlineGroups.reduce<Record<string, number>>((result, lesson) => {
    result[lesson.title] = (result[lesson.title] ?? 0) + 1;
    return result;
  }, {});
  const trialByPerson = trialLessons.reduce<Record<string, number>>((result, lesson) => {
    result[lesson.title] = (result[lesson.title] ?? 0) + 1;
    return result;
  }, {});
  const metricValues: Record<MetricKey, string> = {
    offline: String(offlineGroups.length),
    online: String(onlineGroups.length),
    individual: String(individualLessons.length),
    trial: String(trialLessons.length),
    club: String(clubs.length),
    attendance: `${attendanceRate}%`,
  };
  const monthlySeries = [2, 3, 4, 5, 6].map((monthIndex) => {
    const monthLessons = lessons.filter((lesson) => lesson.date.startsWith(`2026-${String(monthIndex + 1).padStart(2, "0")}`) && !lesson.cancelled);
    return {
      label: monthNames[monthIndex].slice(0, 3),
      offline: monthLessons.filter((lesson) => lesson.category === "group" && !/\bОН\b|онлайн/i.test(lesson.note ?? "")).length,
      online: monthLessons.filter((lesson) => lesson.category === "group" && /\bОН\b|онлайн/i.test(lesson.note ?? "")).length,
      individual: monthLessons.filter((lesson) => lesson.category === "individual").length,
      trial: monthLessons.filter((lesson) => lesson.category === "trial").length,
    };
  });
  const closeMetric = () => {
    setMetricClosing(true);
    window.setTimeout(() => {
      setExpandedMetric(null);
      setMetricClosing(false);
    }, 220);
  };
  return (
    <div className="page-content stats-page">
      <div className="page-heading"><div><p className="eyebrow">Март–июль 2026</p><h1>Статистика</h1><p className="subtitle">Сводка {teacherName} по данным расписания</p></div><select className="month-picker" value={month} onChange={(event) => onMonthChange(Number(event.target.value))} aria-label="Месяц статистики">{[2, 3, 4, 5, 6].map((index) => <option key={index} value={index}>{monthNames[index]} 2026</option>)}</select></div>
      <div className="stat-grid stat-grid-primary">
        <StatCard metric="offline" label="Групповые занятия офлайн" value={metricValues.offline} meta={`проведено в ${monthNamesPrepositional[month]}`} tone="group-tone" onOpen={setExpandedMetric} />
        <StatCard metric="online" label="Групповые занятия онлайн" value={metricValues.online} meta="в этом месяце" tone="online-tone" onOpen={setExpandedMetric} />
        <StatCard metric="individual" label="Индивидуальные занятия" value={metricValues.individual} meta={`проведено в ${monthNamesPrepositional[month]}`} tone="individual-tone" onOpen={setExpandedMetric} />
        <StatCard metric="trial" label="Проб+конс и тестирования" value={metricValues.trial} meta="назначенные мероприятия" tone="trial-tone" onOpen={setExpandedMetric} />
      </div>
      <div className="stats-middle-grid">
        <StatCard metric="club" label="Разговорные клубы" value={metricValues.club} meta={`${offlineClubs.length} очно · ${onlineClubs.length} онлайн`} tone="club-tone" onOpen={setExpandedMetric} featured />
        <section className="month-summary-card">
          <div><p className="eyebrow">Сводка месяца</p><h2>{conducted.length} занятий проведено</h2><span>Спокойный рабочий ритм без гонки за цифрами.</span></div>
          <div className="summary-metrics"><span><strong>{lessonHours.toLocaleString("ru-RU", { maximumFractionDigits: 1 })}</strong> учебных часов</span><span><strong>{workingDays}</strong> рабочих дней</span><span><strong>{cancelled}</strong> отменено</span></div>
        </section>
      </div>
      <div className="stats-chart-grid">
        <MonthlyLinesChart data={monthlySeries} />
        <section className="chart-card format-donut-card">
          <div><p className="eyebrow">Распределение</p><h2>Форматы занятий</h2></div>
          <div className="format-donut" style={{ "--offline": `${offlineGroups.length / totalFormats * 100}%`, "--individual": `${(offlineGroups.length + individualLessons.length) / totalFormats * 100}%`, "--trial": `${(offlineGroups.length + individualLessons.length + trialLessons.length) / totalFormats * 100}%` } as React.CSSProperties}><strong>{conducted.length}</strong><span>всего</span></div>
          <div className="donut-legend"><span><i className="dot-offline" />Офлайн {offlineGroups.length}</span><span><i className="dot-individual" />Индивидуальные {individualLessons.length}</span><span><i className="dot-trial" />Пробные {trialLessons.length}</span><span><i className="dot-online" />Онлайн {onlineGroups.length}</span></div>
        </section>
      </div>
      <div className="stats-support-grid">
        <section className="support-card format-card"><p className="eyebrow">Структура месяца</p><h2>Баланс форматов</h2><div className="format-bars"><span><i className="format-offline" style={{ width: `${offlineGroups.length / totalFormats * 100}%` }} />Офлайн-группы <strong>{offlineGroups.length}</strong></span><span><i className="format-individual" style={{ width: `${individualLessons.length / totalFormats * 100}%` }} />Индивидуальные <strong>{individualLessons.length}</strong></span><span><i className="format-trial" style={{ width: `${trialLessons.length / totalFormats * 100}%` }} />Пробные и тесты <strong>{trialLessons.length}</strong></span></div></section>
        <section className="support-card rhythm-card"><p className="eyebrow">Рабочий ритм</p><h2>{workingDays ? (conducted.length / workingDays).toLocaleString("ru-RU", { maximumFractionDigits: 1 }) : "—"}</h2><span>занятия в среднем за рабочий день</span><small>У расписания хороший, уверенный пульс.</small></section>
        <section className="support-card attendance-ring-card"><div className="attendance-ring" style={{ "--attendance": `${attendanceRate * 3.6}deg` } as React.CSSProperties}><strong>{attendanceRate}%</strong></div><div><p className="eyebrow">Посещаемость</p><h2>{present} из {totalStudentVisits}</h2><span>учебных посещений за месяц</span></div></section>
      </div>
      {expandedMetric && <MetricDetailDialog metric={expandedMetric} value={metricValues[expandedMetric]} month={month} closing={metricClosing} attendanceRate={attendanceRate} present={present} absent={absent} groupByCourse={groupByCourse} individualByStudent={individualByStudent} trialByPerson={trialByPerson} onlineCount={onlineGroups.length} clubRows={{ "Разговорный клуб офлайн": offlineClubs.length, "Разговорный клуб онлайн": onlineClubs.length }} onClose={closeMetric} />}
    </div>
  );
}

function MonthlyLinesChart({ data }: { data: Array<{ label: string; offline: number; online: number; individual: number; trial: number }> }) {
  const maxValue = Math.max(...data.flatMap((item) => [item.offline, item.online, item.individual, item.trial]), 1);
  const points = (key: "offline" | "online" | "individual" | "trial") => data.map((item, index) => `${10 + index * 20},${88 - item[key] / maxValue * 70}`).join(" ");
  return <section className="chart-card lines-card"><div><p className="eyebrow">Март–июль</p><h2>Линии расписания</h2><span>Как менялись форматы занятий</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="График количества занятий по месяцам"><path d="M10 88H90" /><path d="M10 53H90" /><path d="M10 18H90" /><polyline className="line-offline" points={points("offline")} /><polyline className="line-online" points={points("online")} /><polyline className="line-individual" points={points("individual")} /><polyline className="line-trial" points={points("trial")} /></svg><div className="line-months">{data.map((item) => <span key={item.label}>{item.label}</span>)}</div><div className="line-legend"><span><i className="dot-offline" />Офлайн</span><span><i className="dot-online" />Онлайн</span><span><i className="dot-individual" />Индивидуальные</span><span><i className="dot-trial" />Пробные</span></div></section>;
}

function StatCard({ metric, label, value, meta, tone, onOpen, featured = false }: { metric: MetricKey; label: string; value: string; meta: string; tone: string; onOpen: (metric: MetricKey) => void; featured?: boolean }) {
  return <button className={`stat-card ${tone} ${featured ? "featured" : ""}`} onClick={() => onOpen(metric)} aria-haspopup="dialog"><span>{label}</span><strong>{value}</strong><p>{meta}</p><em>Подробнее <UiIcon name="arrow-up-right" /></em></button>;
}

function MetricDetailDialog({ metric, value, month, closing, attendanceRate, present, absent, groupByCourse, individualByStudent, trialByPerson, onlineCount, clubRows, onClose }: {
  metric: MetricKey; value: string; month: number; closing: boolean; attendanceRate: number; present: number; absent: number; groupByCourse: Record<string, number>; individualByStudent: Record<string, number>; trialByPerson: Record<string, number>; onlineCount: number; clubRows: Record<string, number>; onClose: () => void;
}) {
  const configs: Record<MetricKey, { title: string; tone: string; message: string; rows: Record<string, number> }> = {
    offline: { title: "Групповые занятия офлайн", tone: "group-tone", message: "Живой класс, стабильный ритм и хорошая работа с группой.", rows: groupByCourse },
    online: { title: "Групповые занятия онлайн", tone: "online-tone", message: onlineCount ? "Онлайн-группы уверенно встроились в расписание." : "Их время ещё не пришло. Но мы уже поставили чайник и с нетерпением ждём встречи в эфире.", rows: onlineCount ? { "Онлайн-группы": onlineCount } : {} },
    individual: { title: "Индивидуальные занятия", tone: "individual-tone", message: "Персональная работа требует особой концентрации. Отличный темп!", rows: individualByStudent },
    trial: { title: "Проб+конс и тестирования", tone: "trial-tone", message: "Каждая такая встреча помогает новому ученику сделать первый шаг.", rows: trialByPerson },
    club: { title: "Разговорные клубы", tone: "club-tone", message: Number(value) ? "Живой разговор — лучший способ заставить язык звучать." : "В этом месяце разговорные клубы ещё собирают голоса.", rows: clubRows },
    attendance: { title: "Посещаемость", tone: "attendance-tone", message: attendanceRate >= 80 ? "Кажется, звёзды сошлись — и почти все нашли дорогу на занятие." : "Луна была не в той фазе. Самое время съесть ещё этих мягких французских булочек да выпить чаю.", rows: { "Присутствовали": present, "Пропустили": absent } },
  };
  const config = configs[metric];
  const rows = Object.entries(config.rows).sort((a, b) => b[1] - a[1]);
  return <div className={`metric-detail-layer ${closing ? "closing" : ""}`} onMouseDown={onClose}><section className={`metric-detail-card ${config.tone}`} role="dialog" aria-modal="true" aria-labelledby="metric-detail-title" onMouseDown={(event) => event.stopPropagation()}><button className="metric-detail-close" onClick={onClose} aria-label="Закрыть подробную статистику"><UiIcon name="close" /></button><div className="metric-detail-copy"><p className="eyebrow">{monthNames[month]} 2026</p><h2 id="metric-detail-title">{config.title}</h2><strong className="metric-detail-value">{value}</strong><span className="metric-detail-caption">показатель за выбранный месяц</span><p>{config.message}</p><div className="metric-detail-list">{rows.length ? rows.map(([label, count]) => <div key={label}><span>{label}</span><strong>{count}</strong></div>) : <div><span>Пока здесь тихо</span><strong>0</strong></div>}</div></div></section></div>;
}

function ProfileView({ installed, profile, onInstall, onEdit, onLogout }: {
  installed: boolean;
  profile: TeacherProfile;
  onInstall: () => void;
  onEdit: () => void;
  onLogout: () => void;
}) {
  const [profileSection, setProfileSection] = useState<"availability" | "trialAvailability" | "message" | null>(null);
  const [showAvailabilityForm, setShowAvailabilityForm] = useState(false);
  const [availability, setAvailability] = useState([{ id: 1, date: "2026-07-18", from: "15:00", to: "19:00", status: "Отправлено" }]);
  const [draftAvailability, setDraftAvailability] = useState({ date: currentDate, from: "09:00", to: "18:00" });
  const [showTrialForm, setShowTrialForm] = useState(false);
  const [trialAvailability, setTrialAvailability] = useState([{ id: 1, date: "2026-07-16", from: "17:00", to: "19:00" }]);
  const [editingTrialId, setEditingTrialId] = useState<number | null>(null);
  const [draftTrial, setDraftTrial] = useState({ date: currentDate, from: "16:00", to: "19:00" });
  const [adminMessage, setAdminMessage] = useState("");
  const addAvailability = () => {
    setAvailability((current) => [...current, { id: Date.now(), ...draftAvailability, status: "Отправлено" }]);
    setShowAvailabilityForm(false);
  };
  const saveTrialAvailability = () => {
    if (editingTrialId) {
      setTrialAvailability((current) => current.map((item) => item.id === editingTrialId ? { ...item, ...draftTrial } : item));
    } else {
      setTrialAvailability((current) => [...current, { id: Date.now(), ...draftTrial }]);
    }
    setEditingTrialId(null);
    setShowTrialForm(false);
  };
  const editTrialAvailability = (item: (typeof trialAvailability)[number]) => {
    setDraftTrial({ date: item.date, from: item.from, to: item.to });
    setEditingTrialId(item.id);
    setShowTrialForm(true);
  };
  const openAvailabilityForm = () => {
    setDraftAvailability({ date: currentDate, from: "09:00", to: "18:00" });
    setShowAvailabilityForm(true);
  };
  const openTrialForm = () => {
    setEditingTrialId(null);
    setDraftTrial({ date: currentDate, from: "16:00", to: "19:00" });
    setShowTrialForm(true);
  };
  const sendMessage = () => {
    if (!adminMessage.trim()) return;
    window.location.href = `mailto:?subject=${encodeURIComponent("Сообщение администратору Jenga")}&body=${encodeURIComponent(adminMessage.trim())}`;
    setAdminMessage("");
    setProfileSection(null);
  };
  return (
    <div className="page-content profile-page">
      <div className="page-heading"><div><p className="eyebrow">Личный кабинет</p><h1>Профиль</h1></div></div>
      <section className="profile-card">
        <Avatar className="profile-avatar" />
        <div><h2>{profile.firstName} {profile.lastName}</h2><p>{profile.role}</p><span>{profile.education}</span></div>
        <button className="button secondary" onClick={onEdit}>Редактировать</button>
      </section>
      <section className="profile-actions-card">
        <button onClick={() => { openAvailabilityForm(); setProfileSection("availability"); }}><span><i><UiIcon name="clock" /></i><strong>Моя доступность</strong></span><em>{availability.length} периода ›</em></button>
        <button className="trial-slots-row" onClick={() => { openTrialForm(); setProfileSection("trialAvailability"); }}><span><i><UiIcon name="calendar" /></i><strong>Время для пробных и тестирований</strong></span><em>{trialAvailability.length} окно ›</em></button>
        <button className="admin-message-row" onClick={() => setProfileSection("message")}><span><i><UiIcon name="mail" /></i><strong>Написать администратору</strong></span><em>›</em></button>
      </section>
      <section className="settings-card">
        <h2>Настройки</h2>
        <button><span><i>RU</i><strong>Язык интерфейса</strong></span><em>Русский ›</em></button>
        <button><span><i><UiIcon name="bell" /></i><strong>Уведомления</strong></span><em>Включены ›</em></button>
        <button><span><i>?</i><strong>Помощь</strong></span><em>›</em></button>
        <button className="logout-row" onClick={onLogout}><span><i><UiIcon name="logout" /></i><strong>Выйти из аккаунта</strong></span><em>›</em></button>
      </section>
      <section className="install-card">
        <div className="install-card-icon official-mark" aria-hidden="true" />
        <div>
          <span className="install-kicker">{installed ? "Установлено" : "Приложение для iPhone"}</span>
          <h2>{installed ? "Jenga уже на устройстве" : "Добавить на экран «Домой»"}</h2>
          <p>{installed ? "Вы открыли полноэкранную версию приложения." : "Будет открываться как обычное приложение — с собственной иконкой и без адресной строки."}</p>
        </div>
        <button className="button install-button" onClick={onInstall}>{installed ? "Инструкция" : "Как установить"}</button>
      </section>
      <div className="prototype-note"><strong>Тестовый аккаунт на реальном расписании</strong><p>Занятия загружены за период с 2 марта по 19 июля 2026 года. Отмены и комментарии перенесены из исходной таблицы; составы групп пока обозначены временными участниками.</p></div>
      {profileSection === "availability" && (
        <div className="modal-backdrop action-backdrop" onMouseDown={() => setProfileSection(null)}>
          <section className="action-dialog availability-dialog" role="dialog" aria-modal="true" aria-labelledby="availability-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="icon-button action-close" onClick={() => setProfileSection(null)} aria-label="Закрыть"><UiIcon name="close" /></button>
            <p className="eyebrow">Расписание</p>
            <h2 id="availability-title">Моя доступность</h2>
            <p className="action-hint">Отметьте время, когда вам нельзя назначать занятия.</p>
            {showAvailabilityForm ? (
              <div className="availability-form">
                <label><span>Дата</span><input type="date" value={draftAvailability.date} onChange={(event) => setDraftAvailability({ ...draftAvailability, date: event.target.value })} /></label>
                <div><label><span>С</span><input type="time" value={draftAvailability.from} onChange={(event) => setDraftAvailability({ ...draftAvailability, from: event.target.value })} /></label><label><span>До</span><input type="time" value={draftAvailability.to} onChange={(event) => setDraftAvailability({ ...draftAvailability, to: event.target.value })} /></label></div>
                <button className="button primary" onClick={addAvailability}>Отправить администратору</button>
              </div>
            ) : (
              <div className="slot-list-screen">
                <button className="button primary slot-add-button" onClick={openAvailabilityForm}><UiIcon name="plus" />Добавить время</button>
                <div className="availability-list">{availability.length ? availability.map((item) => <button key={item.id} onClick={() => setAvailability((current) => current.filter((entry) => entry.id !== item.id))}><span><strong>{item.date.split("-").reverse().join(".")}</strong><small>{item.from}–{item.to}</small></span><em>{item.status} · удалить</em></button>) : <p className="slot-empty">Отправленных периодов пока нет.</p>}</div>
              </div>
            )}
          </section>
        </div>
      )}
      {profileSection === "trialAvailability" && (
        <div className="modal-backdrop action-backdrop" onMouseDown={() => setProfileSection(null)}>
          <section className="action-dialog availability-dialog trial-availability-dialog" role="dialog" aria-modal="true" aria-labelledby="trial-availability-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="icon-button action-close" onClick={() => setProfileSection(null)} aria-label="Закрыть"><UiIcon name="close" /></button>
            <p className="eyebrow">Пробные и тестирования</p>
            <h2 id="trial-availability-title">Когда я могу провести занятие</h2>
            <p className="action-hint">Выберите удобные дату и время, когда вы сможете провести пробное занятие, консультацию или тестирование.</p>
            {showTrialForm ? (
              <div className="availability-form trial-form">
                <label><span>Дата</span><input type="date" value={draftTrial.date} onChange={(event) => setDraftTrial({ ...draftTrial, date: event.target.value })} /></label>
                <div><label><span>С</span><input type="time" value={draftTrial.from} onChange={(event) => setDraftTrial({ ...draftTrial, from: event.target.value })} /></label><label><span>До</span><input type="time" value={draftTrial.to} onChange={(event) => setDraftTrial({ ...draftTrial, to: event.target.value })} /></label></div>
                <button className="button trial-submit" onClick={saveTrialAvailability}>{editingTrialId ? "Сохранить изменения" : "Отправить администратору"}</button>
              </div>
            ) : (
              <div className="slot-list-screen">
                <button className="button primary slot-add-button" onClick={openTrialForm}><UiIcon name="plus" />Добавить время</button>
                <div className="availability-list trial-list">{trialAvailability.length ? trialAvailability.map((item) => <div className="trial-slot" key={item.id}><button className="trial-slot-main" onClick={() => editTrialAvailability(item)}><span><strong>{item.date.split("-").reverse().join(".")}</strong><small>{item.from}–{item.to}</small></span><em>Изменить</em></button><button className="trial-slot-remove" onClick={() => setTrialAvailability((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Удалить время"><UiIcon name="close" /></button></div>) : <p className="slot-empty">Свободных временных окон пока нет.</p>}</div>
              </div>
            )}
          </section>
        </div>
      )}
      {profileSection === "message" && <div className="modal-backdrop action-backdrop" onMouseDown={() => setProfileSection(null)}><section className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="message-title" onMouseDown={(event) => event.stopPropagation()}><button className="icon-button action-close" onClick={() => setProfileSection(null)} aria-label="Закрыть"><UiIcon name="close" /></button><p className="eyebrow">Связь со школой</p><h2 id="message-title">Написать администратору</h2><p className="action-hint">Сообщение откроется в вашем почтовом приложении. Адрес администратора подключим после согласования.</p><label className="action-comment"><span>Сообщение</span><textarea value={adminMessage} onChange={(event) => setAdminMessage(event.target.value)} placeholder="Напишите, что случилось или что нужно уточнить…" /></label><button className="button school-submit wide" onClick={sendMessage} disabled={!adminMessage.trim()}>Отправить</button></section></div>}
    </div>
  );
}

function LessonActionDialog({ type, comment, date, time, onCommentChange, onDateChange, onTimeChange, onClose, onSubmit }: {
  type: LessonAction;
  comment: string;
  date: string;
  time: string;
  onCommentChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const isCancel = type === "cancel";
  return (
    <div className="modal-backdrop action-backdrop" onMouseDown={onClose}>
      <section className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="action-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button action-close" onClick={onClose} aria-label="Закрыть"><UiIcon name="close" /></button>
        <span className={isCancel ? "action-icon danger" : "action-icon"}><UiIcon name={isCancel ? "close" : "arrow-up-right"} /></span>
        <p className="eyebrow">{isCancel ? "Отмена занятия" : "Перенос занятия"}</p>
        <h2 id="action-title">{isCancel ? "Почему занятие отменяется?" : "Куда перенести занятие?"}</h2>
        <p className="action-hint">{isCancel ? "Комментарий увидит администратор школы." : "Укажите желаемые дату и время. Администратор подтвердит перенос позднее."}</p>
        {!isCancel && (
          <div className="action-date-row">
            <label><span>Новая дата</span><input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} /></label>
            <label><span>Время</span><input type="time" value={time} onChange={(event) => onTimeChange(event.target.value)} /></label>
          </div>
        )}
        <label className="action-comment"><span>{isCancel ? "Причина отмены" : "Комментарий"}</span><textarea value={comment} onChange={(event) => onCommentChange(event.target.value)} placeholder={isCancel ? "Например: ученик предупредил о болезни" : "Например: время согласовано с учеником"} /></label>
        <div className="dialog-actions">
          <button className="button secondary" onClick={onClose}>Назад</button>
          <button className={isCancel ? "button danger-button" : "button primary"} onClick={onSubmit}>{isCancel ? "Подтвердить отмену" : "Сохранить перенос"}</button>
        </div>
      </section>
    </div>
  );
}

function ProfileEditDialog({ profile, onClose, onSave }: { profile: TeacherProfile; onClose: () => void; onSave: (profile: TeacherProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  const setField = (field: keyof TeacherProfile, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  return (
    <div className="modal-backdrop action-backdrop" onMouseDown={onClose}>
      <section className="profile-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button action-close" onClick={onClose} aria-label="Закрыть"><UiIcon name="close" /></button>
        <Avatar className="profile-edit-avatar" />
        <p className="eyebrow">Личный кабинет</p>
        <h2 id="profile-edit-title">Редактировать профиль</h2>
        <div className="profile-fields two-columns">
          <label><span>Имя</span><input value={draft.firstName} onChange={(event) => setField("firstName", event.target.value)} /></label>
          <label><span>Фамилия</span><input value={draft.lastName} onChange={(event) => setField("lastName", event.target.value)} /></label>
        </div>
        <div className="profile-fields">
          <label><span>Должность</span><input value={draft.role} onChange={(event) => setField("role", event.target.value)} /></label>
          <label><span>Образование</span><input value={draft.education} onChange={(event) => setField("education", event.target.value)} /></label>
        </div>
        <div className="dialog-actions">
          <button className="button secondary" onClick={onClose}>Отмена</button>
          <button className="button primary" onClick={() => onSave(draft)}>Сохранить</button>
        </div>
      </section>
    </div>
  );
}

