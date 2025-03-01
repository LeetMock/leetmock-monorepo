# RequestQuestionsUpdateQuestionArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**category** | **List[str]** |  | [optional] 
**companies** | **List[str]** |  | [optional] 
**difficulty** | **float** |  | [optional] 
**eval_mode** | [**RequestQuestionsCreateQuestionArgsEvalMode**](RequestQuestionsCreateQuestionArgsEvalMode.md) |  | [optional] 
**function_name** | **str** |  | [optional] 
**input_parameters** | **object** |  | [optional] 
**meta_data** | **object** |  | [optional] 
**output_parameters** | **str** |  | [optional] 
**question** | **str** |  | [optional] 
**question_id** | **str** | ID from table \&quot;questions\&quot; | 
**question_sets** | **List[str]** |  | [optional] 
**solutions** | **object** |  | [optional] 
**tests** | [**List[RequestQuestionsCreateQuestionArgsTestsInner]**](RequestQuestionsCreateQuestionArgsTestsInner.md) |  | [optional] 
**title** | **str** |  | [optional] 

## Example

```python
from convex_client.models.request_questions_update_question_args import RequestQuestionsUpdateQuestionArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestQuestionsUpdateQuestionArgs from a JSON string
request_questions_update_question_args_instance = RequestQuestionsUpdateQuestionArgs.from_json(json)
# print the JSON string representation of the object
print(RequestQuestionsUpdateQuestionArgs.to_json())

# convert the object into a dict
request_questions_update_question_args_dict = request_questions_update_question_args_instance.to_dict()
# create an instance of RequestQuestionsUpdateQuestionArgs from a dict
request_questions_update_question_args_from_dict = RequestQuestionsUpdateQuestionArgs.from_dict(request_questions_update_question_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


