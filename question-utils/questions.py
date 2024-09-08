from dataclasses import dataclass, field
from typing import List, Dict, Union, Any

@dataclass
class Test:
    input: Any
    output: Any

@dataclass
class Question:
    category: List[str]
    difficulty: float
    question: str
    solutions: Any
    functionName: str
    inputParameters: Dict[str, List[str]]
    startingCode: Dict[str, str]
    # dataStructure: Union[Literal["ListNode"], Literal["TreeNode"], Literal["DoubleListNode"], Literal["None"]]
    tests: List[Test]
    title: str

    def __post_init__(self):
        self.tests = [Test(**test) for test in self.tests]

def load_questions(json_data: List[Dict]) -> List[Question]:
    return [Question(**item) for item in json_data]


