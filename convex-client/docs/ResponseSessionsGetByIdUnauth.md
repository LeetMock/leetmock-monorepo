# ResponseSessionsGetByIdUnauth


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_sessions_get_by_id_unauth import ResponseSessionsGetByIdUnauth

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseSessionsGetByIdUnauth from a JSON string
response_sessions_get_by_id_unauth_instance = ResponseSessionsGetByIdUnauth.from_json(json)
# print the JSON string representation of the object
print(ResponseSessionsGetByIdUnauth.to_json())

# convert the object into a dict
response_sessions_get_by_id_unauth_dict = response_sessions_get_by_id_unauth_instance.to_dict()
# create an instance of ResponseSessionsGetByIdUnauth from a dict
response_sessions_get_by_id_unauth_from_dict = ResponseSessionsGetByIdUnauth.from_dict(response_sessions_get_by_id_unauth_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


