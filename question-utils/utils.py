import json


def json2jsonl(input_file, output_file):
    """
    Convert JSON file to JSONL format.

    :param input_file: Path to the input JSON file
    :param output_file: Path to the output JSONL file
    """
    with open(input_file, "r") as f:
        json_data = json.load(f)

    if not isinstance(json_data, list):
        raise ValueError("Input JSON must contain a list of dictionaries")

    with open(output_file, "w") as f:
        for item in json_data:
            f.write(json.dumps(item) + "\n")


def jsonl2json(input_file, output_file):
    """
    Convert JSONL file to JSON format.

    :param input_file: Path to the input JSONL file
    :param output_file: Path to the output JSON file
    """
    json_data = []
    with open(input_file, "r") as f:
        for line in f:
            if line.strip():
                json_data.append(json.loads(line))

    with open(output_file, "w") as f:
        json.dump(json_data, f, indent=2)


def extract_function_name(response: str, keyword) -> str:
    start_tag = "<" + keyword + ">"
    end_tag = "</" + keyword + ">"
    start_index = response.find(start_tag) + len(start_tag)
    end_index = response.find(end_tag)
    return response[start_index:end_index]

def convert_input_parameters(array_format):
    """
    Converts input parameters from array format to nested object format.
    
    Input format example:
    {
        "cpp": ["str1", "string", "str2", "string"],
        "java": ["str1", "String", "str2", "String"]
    }
    
    Output format example:
    {
        "cpp": {"str1": "string", "str2": "string"},
        "java": {"str1": "String", "str2": "String"}
    }
    """
    result = {}
    
    for language, params in array_format.items():
        # Create a dictionary for this language
        param_dict = {}
        
        # Process parameters in pairs (name, type)
        for i in range(0, len(params), 2):
            param_name = params[i]
            param_type = params[i + 1]
            param_dict[param_name] = param_type
            
        result[language] = param_dict
    
    return result


# convert json object from processed question to selected questions
def convert_to_selected_questions(source_folder, target_folder):
    with open(source_folder, "r") as f:
        processed_questions = json.load(f)
    
    selected_questions = []
    for question in processed_questions:
        question["inputParameters"] = convert_input_parameters(question["inputParameters"])
        selected_questions.append(question)

    with open(target_folder, "w") as f:
        json.dump(selected_questions, f, indent=2)
    return selected_questions

# if __name__ == "__main__":
#     # jsonl2json(
#     #     "./output/processed_questions.jsonl", "./output/processed_questions.json"
#     # )

#     source_folder = "./output/processed_questions.json"
#     target_folder = "./output/new_selected_questions.json"
#     convert_to_selected_questions(source_folder, target_folder)
