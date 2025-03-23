# ResponseCodingQuestionSetGetCodingQuestionSets


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_coding_question_set_get_coding_question_sets import ResponseCodingQuestionSetGetCodingQuestionSets

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodingQuestionSetGetCodingQuestionSets from a JSON string
response_coding_question_set_get_coding_question_sets_instance = ResponseCodingQuestionSetGetCodingQuestionSets.from_json(json)
# print the JSON string representation of the object
print(ResponseCodingQuestionSetGetCodingQuestionSets.to_json())

# convert the object into a dict
response_coding_question_set_get_coding_question_sets_dict = response_coding_question_set_get_coding_question_sets_instance.to_dict()
# create an instance of ResponseCodingQuestionSetGetCodingQuestionSets from a dict
response_coding_question_set_get_coding_question_sets_from_dict = ResponseCodingQuestionSetGetCodingQuestionSets.from_dict(response_coding_question_set_get_coding_question_sets_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


