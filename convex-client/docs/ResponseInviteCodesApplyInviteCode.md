# ResponseInviteCodesApplyInviteCode


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**status** | **str** |  | 
**error_message** | **str** |  | [optional] 
**error_data** | **object** |  | [optional] 
**value** | **object** |  | [optional] 

## Example

```python
from convex_client.models.response_invite_codes_apply_invite_code import ResponseInviteCodesApplyInviteCode

# TODO update the JSON string below
json = "{}"
# create an instance of ResponseInviteCodesApplyInviteCode from a JSON string
response_invite_codes_apply_invite_code_instance = ResponseInviteCodesApplyInviteCode.from_json(json)
# print the JSON string representation of the object
print(ResponseInviteCodesApplyInviteCode.to_json())

# convert the object into a dict
response_invite_codes_apply_invite_code_dict = response_invite_codes_apply_invite_code_instance.to_dict()
# create an instance of ResponseInviteCodesApplyInviteCode from a dict
response_invite_codes_apply_invite_code_from_dict = ResponseInviteCodesApplyInviteCode.from_dict(response_invite_codes_apply_invite_code_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


