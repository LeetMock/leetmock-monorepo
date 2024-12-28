# RequestQuestionsCreateQuestionArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**category** | **List[str]** |  | 
**difficulty** | **float** |  | 
**eval_mode** | [**RequestQuestionsCreateQuestionArgsEvalMode**](RequestQuestionsCreateQuestionArgsEvalMode.md) |  | 
**function_name** | **str** |  | 
**input_parameters** | **object** |  | 
**meta_data** | **object** |  | [optional] 
**output_parameters** | **str** |  | 
**question** | **str** |  | 
**solutions** | **object** |  | 
**tests** | [**List[RequestQuestionsCreateQuestionArgsTestsInner]**](RequestQuestionsCreateQuestionArgsTestsInner.md) |  | 
**title** | **str** |  | 

## Example

```python
from convex_client.models.request_questions_create_question_args import RequestQuestionsCreateQuestionArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsCreateQuestionArgs from a JSON string
request_questions_create_question_args_instance = RequestQuestionsCreateQuestionArgs.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsCreateQuestionArgs.to_json())

# convert the object into a dict
request_questions_create_question_args_dict = request_questions_create_question_args_instance.to_dict()
# create an instance of RequestQuestionsCreateQuestionArgs from a dict
request_questions_create_question_args_from_dict = RequestQuestionsCreateQuestionArgs.from_dict(request_questions_create_question_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


