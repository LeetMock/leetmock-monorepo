# ResponseQuestionsGetAll


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_questions_get_all import ResponseQuestionsGetAll

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseQuestionsGetAll from a JSON string
response_questions_get_all_instance = ResponseQuestionsGetAll.from_json(json)
# print the JSON string representation of the object
print(ResponseQuestionsGetAll.to_json())

# convert the object into a dict
response_questions_get_all_dict = response_questions_get_all_instance.to_dict()
# create an instance of ResponseQuestionsGetAll from a dict
response_questions_get_all_from_dict = ResponseQuestionsGetAll.from_dict(response_questions_get_all_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


