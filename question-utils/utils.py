import json

def json2jsonl(input_file, output_file):
    """
    Convert JSON file to JSONL format.
    
    :param input_file: Path to the input JSON file
    :param output_file: Path to the output JSONL file
    """
    with open(input_file, 'r') as f:
        json_data = json.load(f)
    
    if not isinstance(json_data, list):
        raise ValueError("Input JSON must contain a list of dictionaries")
    
    with open(output_file, 'w') as f:
        for item in json_data:
            f.write(json.dumps(item) + '\n')

def jsonl2json(input_file, output_file):
    """
    Convert JSONL file to JSON format.
    
    :param input_file: Path to the input JSONL file
    :param output_file: Path to the output JSON file
    """
    json_data = []
    with open(input_file, 'r') as f:
        for line in f:
            if line.strip():
                json_data.append(json.loads(line))
    
    with open(output_file, 'w') as f:
        json.dump(json_data, f, indent=2)

    
def extract_function_name(response: str, keyword) -> str:
    start_tag = "<" + keyword + ">"
    end_tag = "</" + keyword + ">"
    start_index = response.find(start_tag) + len(start_tag)
    end_index = response.find(end_tag)
    return response[start_index:end_index]