# ResponseQuestionsDeleteQuestion


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_questions_delete_question import ResponseQuestionsDeleteQuestion

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseQuestionsDeleteQuestion from a JSON string
response_questions_delete_question_instance = ResponseQuestionsDeleteQuestion.from_json(json)
# print the JSON string representation of the object
print(ResponseQuestionsDeleteQuestion.to_json())

# convert the object into a dict
response_questions_delete_question_dict = response_questions_delete_question_instance.to_dict()
# create an instance of ResponseQuestionsDeleteQuestion from a dict
response_questions_delete_question_from_dict = ResponseQuestionsDeleteQuestion.from_dict(response_questions_delete_question_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


