import './DeveloperInfo.scss'

type DeveloperInfoProps = {
    open: boolean;
    setOpen: (open: boolean) => void
}

export const DeveloperInfo = (props: DeveloperInfoProps) => {
    return(<div className="developer-info">
        <button
            className="close-button"
            title="סגירה"
            onClick={() => props.setOpen(!props.open)}
            >
            סגירה
        </button>
        <div className='app-info'>
            <h1>מה זה Task Fitter?</h1>
            <p>
                <ul className="feature-list">
                    <li>ניהול משימות בפרויקטים.</li>
                    <li>המשימות מחולקות לפי נושאים, וניתן ליצור בכל פרויקט תת פרויקטים.</li>
                    <li>כל משימה מכילה תאריך לסיום (דדליין), משתתפים שאחראיים לביצוע המשימה וסטטוס (בוצע / לא בוצע).</li>
                    <li>ניהול רשימת אנשי קשר שמקושרת לניהול המשתתפים במשימות השונות</li>
                </ul>
                <h2>חשבונות בעלי גישת מנהל יכולים:</h2>
                <ul className="admin-list">
                    <li>ליצור פרויקט ולשתף עם חשבונות אחרים.</li>
                    <li>לשלוח אימיילים אישיים לכל המשתתפים בפרויקט בקליק. כל אמייל מכיל רשימה של המשימות שאיש הקשר משתתף בהם בפרויקט וקישור לפרוטוקול שמפרט את כל המשימות בפרויקט.</li>
                </ul>
                <h2>חשבונות ללא גישת מנהל יכולים:</h2>
                <ul className="non-admin-list">
                    <li>לגשת לפרויקטים ששותפו איתם.</li>
                    <li>
                        לבצע את כל הפעולות שלא שמורות למנהלים כולל:
                        <ul>
                            <li>יצירת ועריכת נושאים ומשימות.</li>
                            <li>יצירת ועריכת תת פרויקטים.</li>
                            <li>ניהול אנשי קשר.</li>
                        </ul>
                    </li>
                </ul>
            </p>
        </div>
        <div className='technical-info'>
            <h1>מידע טכני</h1>
            <p>
                <ul>
                    <li>האפליקציה היא פרויקט עצמאי ונתמכת על ידי דוד פורטל.</li>
                    <li>השימוש באפליקציה מיועד למשתמשים מאושרים בלבד.</li>
                    <li>
                        לדיווח על באגים, הצעות לשיפור ומידע נוסף, ניתן לשלוח אימייל לכתובת מטה.
                    </li>
                </ul>
            </p>
        </div>
        <h3>davidportal91@gmail.com</h3>
    </div>)
}