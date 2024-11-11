# RequestSessionsEndSessionArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**session_id** | **str** | ID from table \&quot;sessions\&quot; | 

## Example

```python
from convex_client.models.request_sessions_end_session_args import RequestSessionsEndSessionArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestSessionsEndSessionArgs from a JSON string
request_sessions_end_session_args_instance = RequestSessionsEndSessionArgs.from_json(json)
# print the JSON string representation of the object
print(RequestSessionsEndSessionArgs.to_json())

# convert the object into a dict
request_sessions_end_session_args_dict = request_sessions_end_session_args_instance.to_dict()
# create an instance of RequestSessionsEndSessionArgs from a dict
request_sessions_end_session_args_from_dict = RequestSessionsEndSessionArgs.from_dict(request_sessions_end_session_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


