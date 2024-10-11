# RequestAdminsPatchUserSubscriptionArgs


## Properties

Name | Type | Description | Notes
------------ | ------------- | ------------- | -------------
**minutes_remaining** | **float** |  | [optional] 
**next_billing_date** | **float** |  | [optional] 
**subscription** | [**RequestAdminsCreateUserProfileArgsSubscription**](RequestAdminsCreateUserProfileArgsSubscription.md) |  | [optional] 
**user_id** | **str** |  | 

## Example

```python
from convex_client.models.request_admins_patch_user_subscription_args import RequestAdminsPatchUserSubscriptionArgs

# TODO update the JSON string below
json = "{}"
# create an instance of RequestAdminsPatchUserSubscriptionArgs from a JSON string
request_admins_patch_user_subscription_args_instance = RequestAdminsPatchUserSubscriptionArgs.from_json(json)
# print the JSON string representation of the object
print(RequestAdminsPatchUserSubscriptionArgs.to_json())

# convert the object into a dict
request_admins_patch_user_subscription_args_dict = request_admins_patch_user_subscription_args_instance.to_dict()
# create an instance of RequestAdminsPatchUserSubscriptionArgs from a dict
request_admins_patch_user_subscription_args_from_dict = RequestAdminsPatchUserSubscriptionArgs.from_dict(request_admins_patch_user_subscription_args_dict)
```
[[Back to Model list]](../README.md#documentation-for-models) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to README]](../README.md)


