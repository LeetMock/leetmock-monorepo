# ResponseActionsGetSessionMetadata


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | [**ResponseActionsGetSessionMetadataValue**](ResponseActionsGetSessionMetadataValue.md) |  | [optional] 

## Example

```python
from convex_client.models.response_actions_get_session_metadata import ResponseActionsGetSessionMetadata

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseActionsGetSessionMetadata from a JSON string
response_actions_get_session_metadata_instance = ResponseActionsGetSessionMetadata.from_json(json)
# print the JSON string representation of the object
print(ResponseActionsGetSessionMetadata.to_json())

# convert the object into a dict
response_actions_get_session_metadata_dict = response_actions_get_session_metadata_instance.to_dict()
# create an instance of ResponseActionsGetSessionMetadata from a dict
response_actions_get_session_metadata_from_dict = ResponseActionsGetSessionMetadata.from_dict(response_actions_get_session_metadata_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


