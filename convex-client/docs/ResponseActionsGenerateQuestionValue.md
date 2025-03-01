# ResponseActionsGenerateQuestionValue


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**eval_mode** | **str** |  | 
**function_name** | **str** |  | 
**input_parameters** | **object** |  | 
**tests** | [**List[ResponseActionsGenerateQuestionValueTestsInner]**](ResponseActionsGenerateQuestionValueTestsInner.md) |  | 

## Example

```python
from convex_client.models.response_actions_generate_question_value import ResponseActionsGenerateQuestionValue

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsGenerateQuestionValue from a JSON string
response_actions_generate_question_value_instance = ResponseActionsGenerateQuestionValue.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsGenerateQuestionValue.to_json())

# convert the object into a dict
response_actions_generate_question_value_dict = response_actions_generate_question_value_instance.to_dict()
# create an instance of ResponseActionsGenerateQuestionValue from a dict
response_actions_generate_question_value_from_dict = ResponseActionsGenerateQuestionValue.from_dict(response_actions_generate_question_value_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


