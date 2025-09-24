import WeeklyGoalForm from "./WeeklyGoalForm";
import WeeklyProgress from "./WeeklyProgress";

const WeeklyGoals = ({
  formData,
  setFormData,
  setWeeklyGoal,
  weeklyProgress,
}) => (
  <div className="goals-container">
    <WeeklyGoalForm
      formData={formData}
      setFormData={setFormData}
      setWeeklyGoal={setWeeklyGoal}
    />
    <WeeklyProgress weeklyProgress={weeklyProgress} />
  </div>
);

export default WeeklyGoals;
