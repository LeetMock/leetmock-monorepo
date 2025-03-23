# ResponseCodingQuestionSetCreateCodingQuestionSet


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_coding_question_set_create_coding_question_set import ResponseCodingQuestionSetCreateCodingQuestionSet

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodingQuestionSetCreateCodingQuestionSet from a JSON string
response_coding_question_set_create_coding_question_set_instance = ResponseCodingQuestionSetCreateCodingQuestionSet.from_json(json)
# print the JSON string representation of the object
print(ResponseCodingQuestionSetCreateCodingQuestionSet.to_json())

# convert the object into a dict
response_coding_question_set_create_coding_question_set_dict = response_coding_question_set_create_coding_question_set_instance.to_dict()
# create an instance of ResponseCodingQuestionSetCreateCodingQuestionSet from a dict
response_coding_question_set_create_coding_question_set_from_dict = ResponseCodingQuestionSetCreateCodingQuestionSet.from_dict(response_coding_question_set_create_coding_question_set_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


