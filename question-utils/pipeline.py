from questions import Question, Test
from typing import List, Dict, Union, Any
import json
from data_generation import generate_function_name, generate_input_parameters, generate_tests, generate_evalMode
from endpoint_request import request_leetcode_data, map_endpoint_output_to_question
import os

def start_pipeline(title: str) -> Dict:
    print("processing question: ", title)

    data = request_leetcode_data(title)

    # import question data
    question: Question = map_endpoint_output_to_question(data)
    
    # Generate function name
    question.functionName = generate_function_name(question)

    # Generate input parameters
    question.inputParameters = generate_input_parameters(question)

    # Generate tests
    question.tests = generate_tests(question)

    # Generate evalMode
    question.evalMode = generate_evalMode(question)

    return question.to_dict()



# question = start_pipeline("Delete the Middle Node of a Linked List")

def process_questions_from_file(input_file: str, output_file: str):
    while True:
        # Read the first line from the input file
        with open(input_file, 'r') as f:
            lines = f.readlines()
        
        if not lines:
            print("All questions processed.")
            break
        
        title = lines[0].strip()
        
        try:
            processed_question = start_pipeline(title)
            
            # Append the processed question to the output file
            with open(output_file, 'a') as f:
                if os.path.getsize(output_file) > 0:
                    f.write(',\n')
                json.dump(processed_question, f, indent=2)
            
            print(f"Processed: {title}")
            
            # Remove the processed line from the input file
            with open(input_file, 'w') as f:
                f.writelines(lines[1:])
        
        except Exception as e:
            print(f"Error processing {title}: {str(e)}")
            # Move the problematic line to the end of the file
            with open(input_file, 'w') as f:
                f.writelines(lines[1:] + [lines[0]])
            break  # Terminate the loop when an exception occurs

    # Ensure the output file is a valid JSON array
    with open(output_file, 'r+') as f:
        content = f.read()
        f.seek(0, 0)
        f.write('[\n' + content + '\n]')

if __name__ == "__main__":
    input_file = "data/question_title.txt"
    output_file = "output/processed_questions.json"
    
    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Initialize the output file with an empty array if it doesn't exist
    if not os.path.exists(output_file):
        with open(output_file, 'w') as f:
            f.write('[\n]')
    
    process_questions_from_file(input_file, output_file)