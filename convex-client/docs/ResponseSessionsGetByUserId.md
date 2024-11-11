# ResponseSessionsGetByUserId


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_sessions_get_by_user_id import ResponseSessionsGetByUserId

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseSessionsGetByUserId from a JSON string
response_sessions_get_by_user_id_instance = ResponseSessionsGetByUserId.from_json(json)
# print the JSON string representation of the object
print(ResponseSessionsGetByUserId.to_json())

# convert the object into a dict
response_sessions_get_by_user_id_dict = response_sessions_get_by_user_id_instance.to_dict()
# create an instance of ResponseSessionsGetByUserId from a dict
response_sessions_get_by_user_id_from_dict = ResponseSessionsGetByUserId.from_dict(response_sessions_get_by_user_id_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


