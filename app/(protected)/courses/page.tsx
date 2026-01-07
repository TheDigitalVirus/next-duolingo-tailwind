import { getCourses, getUserProgress } from "@/lib/db/queries";
import { Header } from "./header";
import { List } from "./list";

const CoursesPage = async () => {
  const coursesData = getCourses();
  const userProgressData = getUserProgress();

  const [courses, userProgress] = await Promise.all([
    coursesData,
    userProgressData,
  ]);

  return (
    <div className="mx-auto h-full max-w-228 px-3">
      <Header />

      <List courses={courses} user={userProgress} />
    </div>
  );
};

export default CoursesPage;
