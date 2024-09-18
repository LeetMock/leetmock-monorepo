import json

def generate_starting_code(function_name, input_parameters):
    def python_template():
        params = ', '.join([f"{param}: {param_type}"
                            for param, param_type in zip(input_parameters['python'][::2], input_parameters['python'][1::2])])
        return f"""from typing import List, Optional

class Solution:
    def {function_name}(self, {params}):
        # TODO: Write your Python code here
        pass"""

    def javascript_template():
        params = ', '.join(input_parameters['javascript'][::2])
        param_types = ', '.join(input_parameters['javascript'][1::2])
        return f"""/**
 * @param {{{param_types}}}
 * @return {{any}}
 */
var {function_name} = function({params}) {{
    // TODO: Write your JavaScript code here
}};"""

    def java_template():
        params = ', '.join([f"{param_type} {param}"
                            for param, param_type in zip(input_parameters['java'][::2], input_parameters['java'][1::2])])
        return f"""class Solution {{
    public Object {function_name}({params}) {{
        // TODO: Write your Java code here
        return null;
    }}
}}"""

    def cpp_template():
        params = ', '.join([f"{param_type} {param}"
                            for param, param_type in zip(input_parameters['cpp'][::2], input_parameters['cpp'][1::2])])
        return f"""class Solution {{
public:
    int {function_name}({params}) {{
        // TODO: Write your C++ code here
        return 0;
    }}
}};"""

    return {
        'python': python_template(),
        'javascript': javascript_template(),
        'java': java_template(),
        'cpp': cpp_template()
    }

def extract_starting_code(question_data):
    function_name = question_data['functionName']
    input_parameters = question_data['inputParameters']
    return generate_starting_code(function_name, input_parameters)

if __name__ == "__main__":
    # Load JSON data
    with open('./data/questions.json', 'r') as f:
        questions_data = json.load(f)
    
    # Update starting code for each question
    for question_data in questions_data:
        starting_code = extract_starting_code(question_data)
        question_data['startingCode'] = starting_code

    # Save updated questions_data to a JSON file in the output folder
    output_file = './output/updated_questions.json'
    with open(output_file, 'w') as f:
        json.dump(questions_data, f, indent=2)

    print(f"Updated questions data saved to {output_file}")
