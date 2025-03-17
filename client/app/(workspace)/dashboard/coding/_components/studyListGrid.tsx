import { StudyListItem, StudyPlan } from '../types';
import StudyCard from "./studycard";

function StudyListGrid({ studyLists }: { studyLists: StudyPlan }) {



    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyLists.map((item, index) => (
                    <StudyCard key={index} {...item} />
                ))}
            </div>
        </div>
    );
}

export default StudyListGrid;