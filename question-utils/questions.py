from dataclasses import dataclass, field
from typing import List, Dict, Union, Any

@dataclass
class Test:
    input: Any
    output: Any

    def __dict__(self):
        return {
            'input': self.input,
            'output': self.output
        }

@dataclass
class Question:
    category: List[str]
    difficulty: float
    evalMode: str
    question: str
    solutions: Any
    functionName: str
    inputParameters: Dict[str, List[str]]
    outputParameters: str
    tests: List[Test]
    title: str
    metaData: Dict[any, any]

    def __post_init__(self):
        self.tests = [Test(**test) for test in self.tests]

    def __str__(self):
        return f"Question(title='{self.title}', difficulty={self.difficulty}, functionName='{self.functionName}')"

    def to_dict(self):
        return {
            'category': self.category,
            'difficulty': self.difficulty,
            'evalMode': self.evalMode,
            'question': self.question,
            'solutions': self.solutions,
            'functionName': self.functionName,
            'inputParameters': self.inputParameters,
            'tests': [test.__dict__() for test in self.tests],
            'title': self.title,
            'metaData': self.metaData,
            'outputParameters': self.outputParameters
        }

def load_questions(json_data: List[Dict]) -> List[Question]:
    return [Question(**item) for item in json_data]



