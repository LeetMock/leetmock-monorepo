# RequestSessionsStartSession


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestSessionsEndSessionArgs**](RequestSessionsEndSessionArgs.md) |  | 

## Example

```python
from convex_client.models.request_sessions_start_session import RequestSessionsStartSession

# TODO update the JSON string below
json = "{}"
# create an instance of RequestSessionsStartSession from a JSON string
request_sessions_start_session_instance = RequestSessionsStartSession.from_json(json)
# print the JSON string representation of the object
print(RequestSessionsStartSession.to_json())

# convert the object into a dict
request_sessions_start_session_dict = request_sessions_start_session_instance.to_dict()
# create an instance of RequestSessionsStartSession from a dict
request_sessions_start_session_from_dict = RequestSessionsStartSession.from_dict(request_sessions_start_session_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


