# ResponseQuestionsGetById


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_questions_get_by_id import ResponseQuestionsGetById

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseQuestionsGetById from a JSON string
response_questions_get_by_id_instance = ResponseQuestionsGetById.from_json(json)
# print the JSON string representation of the object
print(ResponseQuestionsGetById.to_json())

# convert the object into a dict
response_questions_get_by_id_dict = response_questions_get_by_id_instance.to_dict()
# create an instance of ResponseQuestionsGetById from a dict
response_questions_get_by_id_from_dict = ResponseQuestionsGetById.from_dict(response_questions_get_by_id_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


