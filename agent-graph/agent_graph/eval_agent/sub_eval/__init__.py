from agent_graph.eval_agent.sub_eval.communication import (
    evaluate_clarification,
    evaluate_thought_process,
    communication_final_evaluation
)
from agent_graph.eval_agent.sub_eval.problem_solving import (
    evaluate_optimal_solution,
    evaluate_optimization_process,
    evaluate_question_specific,
    problem_solving_final_evaluation
)
from agent_graph.eval_agent.sub_eval.technical_competency import (
    evaluate_syntax_error,
    evaluate_code_quality,
    evaluate_coding_speed,
    technical_competency_final_evaluation
)
from agent_graph.eval_agent.sub_eval.testing import (
    evaluate_test_case_coverage,
    evaluate_debugging,
    evaluate_test_case_design,
    testing_final_evaluation
)


COMMUNICATION_TESTS = {"clarification": evaluate_clarification, "thoughtProcess": evaluate_thought_process}
PROBLEM_SOLVING_TESTS = {"optimalSolution": evaluate_optimal_solution, "optimizationProcess": evaluate_optimization_process, "questionSpecific": evaluate_question_specific}
TECHNICAL_COMPETENCY_TESTS = {"syntaxError": evaluate_syntax_error, "codeQuality": evaluate_code_quality, "codingSpeed": evaluate_coding_speed}
TESTING_TESTS = {"testCaseCoverage": evaluate_test_case_coverage, "debugging": evaluate_debugging, "testCaseDesign": evaluate_test_case_design}

EVALUATION_TESTS = {
    "communication": {
        "tests": COMMUNICATION_TESTS,
        "final": communication_final_evaluation
    },
    "problemSolving": {
        "tests": PROBLEM_SOLVING_TESTS,
        "final": problem_solving_final_evaluation
    },
    "technicalCompetency": {
        "tests": TECHNICAL_COMPETENCY_TESTS,
        "final": technical_competency_final_evaluation
    },
    "testing": {
        "tests": TESTING_TESTS,
        "final": testing_final_evaluation
    }
}
