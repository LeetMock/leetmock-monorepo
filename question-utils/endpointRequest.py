from questions import Question, Test
import requests
from typing import List, Dict, Union, Any

def request_leetcode_data(question_title: str) -> dict:
    print("getting data from leetcode... \n ")
    base_url = "http://localhost:3000/select?titleSlug="
    url = base_url + question_title.replace(" ", "-").lower()
    print("url key: ", question_title.replace(" ", "-").lower())
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching data for {question_title}: {e}")
        return {}



def map_endpoint_output_to_question(endpoint_output: Dict[str, Any]) -> Question:
    print("transforming data to Question Object... \n")
    
    required_fields = ['topicTags', 'difficulty', 'question', 'questionTitle']
    missing_fields = [field for field in required_fields if field not in endpoint_output]
    
    if missing_fields:
        raise ValueError(f"Missing required fields in endpoint output: {', '.join(missing_fields)}")
    
    difficulty_map = {
        "Easy": 1,
        "Medium": 2,
        "Hard": 3
    }

    return Question(
        category=[tag['name'] for tag in endpoint_output['topicTags']],
        difficulty=difficulty_map.get(endpoint_output['difficulty'], 0),
        question=endpoint_output['question'],
        solutions={},  # We don't have solution data in the endpoint output
        functionName="",
        inputParameters={},  # We need to extract this from the question text
        tests=[],
        evalMode="",
        title=endpoint_output['questionTitle'],
        metaData={}
    )