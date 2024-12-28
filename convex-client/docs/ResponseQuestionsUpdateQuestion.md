# ResponseQuestionsUpdateQuestion


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_questions_update_question import ResponseQuestionsUpdateQuestion

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseQuestionsUpdateQuestion from a JSON string
response_questions_update_question_instance = ResponseQuestionsUpdateQuestion.from_json(json)
# print the JSON string representation of the object
print(ResponseQuestionsUpdateQuestion.to_json())

# convert the object into a dict
response_questions_update_question_dict = response_questions_update_question_instance.to_dict()
# create an instance of ResponseQuestionsUpdateQuestion from a dict
response_questions_update_question_from_dict = ResponseQuestionsUpdateQuestion.from_dict(response_questions_update_question_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


