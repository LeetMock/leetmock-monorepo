# RequestActionsGetSessionMetadata


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**args** | [**RequestSessionsEndSessionArgs**](RequestSessionsEndSessionArgs.md) |  | 

## Example

```python
from convex_client.models.request_actions_get_session_metadata import RequestActionsGetSessionMetadata

# TODO update the JSON string below
json = "{}"
# create an instance of RequestActionsGetSessionMetadata from a JSON string
request_actions_get_session_metadata_instance = RequestActionsGetSessionMetadata.from_json(json)
# print the JSON string representation of the object
print(RequestActionsGetSessionMetadata.to_json())

# convert the object into a dict
request_actions_get_session_metadata_dict = request_actions_get_session_metadata_instance.to_dict()
# create an instance of RequestActionsGetSessionMetadata from a dict
request_actions_get_session_metadata_from_dict = RequestActionsGetSessionMetadata.from_dict(request_actions_get_session_metadata_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


