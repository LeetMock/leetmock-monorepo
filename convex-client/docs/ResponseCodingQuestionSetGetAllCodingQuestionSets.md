# ResponseCodingQuestionSetGetAllCodingQuestionSets


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_coding_question_set_get_all_coding_question_sets import ResponseCodingQuestionSetGetAllCodingQuestionSets

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseCodingQuestionSetGetAllCodingQuestionSets from a JSON string
response_coding_question_set_get_all_coding_question_sets_instance = ResponseCodingQuestionSetGetAllCodingQuestionSets.from_json(json)
# print the JSON string representation of the object
print(ResponseCodingQuestionSetGetAllCodingQuestionSets.to_json())

# convert the object into a dict
response_coding_question_set_get_all_coding_question_sets_dict = response_coding_question_set_get_all_coding_question_sets_instance.to_dict()
# create an instance of ResponseCodingQuestionSetGetAllCodingQuestionSets from a dict
response_coding_question_set_get_all_coding_question_sets_from_dict = ResponseCodingQuestionSetGetAllCodingQuestionSets.from_dict(response_coding_question_set_get_all_coding_question_sets_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


