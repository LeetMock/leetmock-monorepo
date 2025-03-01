import StudyCard from "./studycard";
import CodeImg from '../../../../../public/code.png';

function StudyListGrid() {

    const studyLists = [
        {
            icon: CodeImg,
            title: "Top Interview 150",
            description: "Must-do List for Interview Prep"
        },
        {
            icon: CodeImg,
            title: "LeetCode 75",
            description: "Ace Coding Interview with 75 Questions"
        },
    ];

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