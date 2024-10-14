# ResponseQuestionsGetByIdInternal


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_questions_get_by_id_internal import ResponseQuestionsGetByIdInternal

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseQuestionsGetByIdInternal from a JSON string
response_questions_get_by_id_internal_instance = ResponseQuestionsGetByIdInternal.from_json(json)
# print the JSON string representation of the object
print(ResponseQuestionsGetByIdInternal.to_json())

# convert the object into a dict
response_questions_get_by_id_internal_dict = response_questions_get_by_id_internal_instance.to_dict()
# create an instance of ResponseQuestionsGetByIdInternal from a dict
response_questions_get_by_id_internal_from_dict = ResponseQuestionsGetByIdInternal.from_dict(response_questions_get_by_id_internal_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


