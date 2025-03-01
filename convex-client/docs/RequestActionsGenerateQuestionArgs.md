# RequestActionsGenerateQuestionArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**question_content** | **str** |  | 
**question_title** | **str** |  | 

## Example

```python
from convex_client.models.request_actions_generate_question_args import RequestActionsGenerateQuestionArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestActionsGenerateQuestionArgs from a JSON string
request_actions_generate_question_args_instance = RequestActionsGenerateQuestionArgs.from_json(json)
# print the JSON string representation of the object
print(RequestActionsGenerateQuestionArgs.to_json())

# convert the object into a dict
request_actions_generate_question_args_dict = request_actions_generate_question_args_instance.to_dict()
# create an instance of RequestActionsGenerateQuestionArgs from a dict
request_actions_generate_question_args_from_dict = RequestActionsGenerateQuestionArgs.from_dict(request_actions_generate_question_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


