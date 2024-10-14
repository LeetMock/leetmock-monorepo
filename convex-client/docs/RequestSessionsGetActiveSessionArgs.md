# RequestSessionsGetActiveSessionArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**user_id** | **str** |  | 

## Example

```python
from convex_client.models.request_sessions_get_active_session_args import RequestSessionsGetActiveSessionArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestSessionsGetActiveSessionArgs from a JSON string
request_sessions_get_active_session_args_instance = RequestSessionsGetActiveSessionArgs.from_json(json)
# print the JSON string representation of the object
print(RequestSessionsGetActiveSessionArgs.to_json())

# convert the object into a dict
request_sessions_get_active_session_args_dict = request_sessions_get_active_session_args_instance.to_dict()
# create an instance of RequestSessionsGetActiveSessionArgs from a dict
request_sessions_get_active_session_args_from_dict = RequestSessionsGetActiveSessionArgs.from_dict(request_sessions_get_active_session_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


