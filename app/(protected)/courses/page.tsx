import { getCourses, } from "@/lib/db/queries";
import { Header } from "./header";
import { List } from "./list";
import { getUserActiveProgress } from "@/actions/user-progress";

const CoursesPage = async () => {
  const coursesData = getCourses();
  const userProgressData = getUserActiveProgress();

  const [courses, userProgress] = await Promise.all([
    coursesData,
    userProgressData,
  ]);

  return (
    <div className="mx-auto h-full max-w-228 px-3">
      <Header />

      <List courses={courses} user={userProgress ?? undefined} />
    </div>
  );
};

export default CoursesPage;
