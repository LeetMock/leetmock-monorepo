# ResponseSessionsGetById


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_sessions_get_by_id import ResponseSessionsGetById

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseSessionsGetById from a JSON string
response_sessions_get_by_id_instance = ResponseSessionsGetById.from_json(json)
# print the JSON string representation of the object
print(ResponseSessionsGetById.to_json())

# convert the object into a dict
response_sessions_get_by_id_dict = response_sessions_get_by_id_instance.to_dict()
# create an instance of ResponseSessionsGetById from a dict
response_sessions_get_by_id_from_dict = ResponseSessionsGetById.from_dict(response_sessions_get_by_id_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


