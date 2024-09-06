# ResponseEditorSnapshotsGetSnapshots


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_editor_snapshots_get_snapshots import ResponseEditorSnapshotsGetSnapshots

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseEditorSnapshotsGetSnapshots from a JSON string
response_editor_snapshots_get_snapshots_instance = ResponseEditorSnapshotsGetSnapshots.from_json(json)
# print the JSON string representation of the object
print(ResponseEditorSnapshotsGetSnapshots.to_json())

# convert the object into a dict
response_editor_snapshots_get_snapshots_dict = response_editor_snapshots_get_snapshots_instance.to_dict()
# create an instance of ResponseEditorSnapshotsGetSnapshots from a dict
response_editor_snapshots_get_snapshots_from_dict = ResponseEditorSnapshotsGetSnapshots.from_dict(response_editor_snapshots_get_snapshots_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


