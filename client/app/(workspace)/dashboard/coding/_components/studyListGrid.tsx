import StudyCard from "./studycard";
import CodeImg from '../../../../../public/code.png';

function StudyListGrid() {

    const studyLists = [
        {
            icon: CodeImg,
            title: "Most Asked Questions",
            description: "Must-do List for Interview Prep",
            name: "Most Popular Questions",
            id: "kx7fctxng4969ys1xtwsm7ty3s7c003k"
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